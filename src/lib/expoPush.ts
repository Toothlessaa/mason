export async function sendExpoPushNotification(token: string, title: string, body?: string) {
  try {
    const response = await fetch("/api/send-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, title, body }),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;
    return response.ok && result?.ok === true;
  } catch {
    return false;
  }
}
