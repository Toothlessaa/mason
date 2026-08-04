import { KJUR, KEYUTIL } from "jsrsasign";
import serviceAccount from "./firebase-service-account.json";

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

  const result = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!result.access_token) return null;

  cachedAccessToken = result.access_token;
  cachedTokenExpiry = now + (result.expires_in ?? 3600) - 60;
  return cachedAccessToken;
}

export async function sendFcmPushNotification(token: string, title: string, body?: string) {
  try {
    const accessToken = await getFcmAccessToken();
    if (!accessToken) return false;

    const notification: Record<string, string> = { title };
    if (body) notification.body = body;

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