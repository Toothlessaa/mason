import * as Notifications from "expo-notifications";
import { KJUR, KEYUTIL } from "jsrsasign";
import { Platform } from "react-native";
import serviceAccount from "./firebase-service-account.json";
import { registerPushToken } from "./memberPortal";

const CHANNEL_ID = "lodge";
const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

const service = serviceAccount as {
  project_id: string;
  client_email: string;
  private_key: string;
  token_uri: string;
};

const FCM_URL = `https://fcm.googleapis.com/v1/projects/${service.project_id}/messages:send`;

let cachedAccessToken: string | null = null;
let cachedTokenExpiry = 0;

async function getFcmAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && now < cachedTokenExpiry) return cachedAccessToken;

  try {
    const header = { alg: "RS256", typ: "JWT" };
    const claims = {
      iss: service.client_email,
      scope: FCM_SCOPE,
      aud: service.token_uri,
      iat: now,
      exp: now + 3600,
    };
    const jwt = KJUR.jws.JWS.sign(
      "RS256",
      header,
      JSON.stringify(claims),
      KEYUTIL.getKey(service.private_key) as Parameters<typeof KJUR.jws.JWS.sign>[3]
    );

    const body = new URLSearchParams();
    body.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
    body.append("assertion", jwt);

    const response = await fetch(service.token_uri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!response.ok) return null;

    const tokenResponse = (await response.json()) as { access_token?: string; expires_in?: number };
    if (!tokenResponse.access_token) return null;

    cachedAccessToken = tokenResponse.access_token;
    cachedTokenExpiry = now + (tokenResponse.expires_in ?? 3600) - 60;
    return cachedAccessToken;
  } catch {
    return null;
  }
}

export function isPushSupported() {
  return Platform.OS !== "web";
}

export function setupNotifications() {
  if (!isPushSupported()) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!isPushSupported()) return null;

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Lodge Updates",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#e2c47a",
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const deviceToken = await Notifications.getDevicePushTokenAsync();
    if (deviceToken.type !== "fcm" || typeof deviceToken.data !== "string") return null;
    return deviceToken.data;
  } catch {
    return null;
  }
}

export type PushMessage = {
  title: string;
  body?: string;
};

export async function getPushPermissionStatus(): Promise<string> {
  if (!isPushSupported()) return "unsupported";
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return "undetermined";
  }
}

export type PushRegistrationResult = {
  permission: string;
  token: string | null;
  saved: boolean;
  error: string | null;
};

export async function registerPushForMember(member: { id: string }): Promise<PushRegistrationResult> {
  if (!isPushSupported()) {
    return { permission: "unsupported", token: null, saved: false, error: null };
  }
  const token = await registerForPushNotificationsAsync();
  if (!token) {
    const permission = await getPushPermissionStatus();
    return {
      permission,
      token: null,
      saved: false,
      error: permission === "granted" ? "Could not obtain a device token." : "Notification permission was not granted.",
    };
  }
  const { error } = await registerPushToken(member.id, token);
  return { permission: "granted", token, saved: !error, error: error ? error.message : null };
}

export async function sendPush(token: string, message: PushMessage) {
  try {
    const accessToken = await getFcmAccessToken();
    if (!accessToken) return false;

    const notification: Record<string, string> = { title: message.title };
    if (message.body) notification.body = message.body;

    const response = await fetch(FCM_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification,
          android: {
            notification: {
              channel_id: CHANNEL_ID,
              sound: "default",
              color: "#e2c47a",
            },
          },
        },
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}