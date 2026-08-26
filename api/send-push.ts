import type { VercelRequest, VercelResponse } from "@vercel/node";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type PushRequest = {
  token?: unknown;
  title?: unknown;
  body?: unknown;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const input = (req.body ?? {}) as PushRequest;
  const token = typeof input.token === "string" ? input.token.trim() : "";
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : undefined;

  if (!/^(ExponentPushToken|ExpoPushToken)\[.+\]$/.test(token) || !title || title.length > 120 || (body && body.length > 500)) {
    return res.status(400).json({ ok: false, error: "Invalid push message" });
  }

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        to: token,
        title,
        ...(body ? { body } : {}),
        sound: "default",
        channelId: "lodge",
        color: "#e2c47a",
      }),
    });
    const result = (await response.json()) as { data?: { status?: string; message?: string } };
    const ok = response.ok && result.data?.status === "ok";
    return res.status(ok ? 200 : 502).json({ ok, result });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error instanceof Error ? error.message : "Expo request failed" });
  }
}
