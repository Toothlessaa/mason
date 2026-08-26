import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { registerPushToken } from "./memberPortal";

const CHANNEL_ID = "lodge";
const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

const projectId =
  process.env.EXPO_PUBLIC_EXPO_PROJECT_ID ??
  Constants.expoConfig?.extra?.eas?.projectId ??
  Constants.easConfig?.projectId;

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

export async function registerForPushNotificationsAsync(): Promise<{ token: string | null; error: string | null }> {
  if (!isPushSupported()) return { token: null, error: null };

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
    if (finalStatus !== "granted") {
      return { token: null, error: `Permission not granted (${finalStatus})` };
    }

    if (!projectId) return { token: null, error: "Missing Expo project ID. Set EXPO_PUBLIC_EXPO_PROJECT_ID in the mobile build environment." };

    const expoToken = await Notifications.getExpoPushTokenAsync({ projectId });
    return { token: expoToken.data, error: null };
  } catch (e) {
    return { token: null, error: e instanceof Error ? e.message : String(e) };
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
  const result = await registerForPushNotificationsAsync();
  if (!result.token) {
    const permission = await getPushPermissionStatus();
    return {
      permission,
      token: null,
      saved: false,
      error: result.error || "No device token obtained.",
    };
  }
  const { error } = await registerPushToken(member.id, result.token);
  return { permission: "granted", token: result.token, saved: !error, error: error ? error.message : null };
}

export async function sendPush(token: string, message: PushMessage) {
  try {
    const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/send-push` : null;
    if (!endpoint) return false;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        title: message.title,
        body: message.body,
      }),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;
    return response.ok && result?.ok === true;
  } catch {
    return false;
  }
}
