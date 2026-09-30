export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe" && request.method === "POST") {
      try {
        const body = await request.json();
        const email = String(body?.email || "").trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return json({ error: "invalid_email" }, 400);
        }

        if (!env.BREVO_API_KEY || !env.BREVO_APP_LIST_ID) {
          return json({ error: "waitlist_not_configured" }, 503);
        }

        const response = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "api-key": env.BREVO_API_KEY,
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            email,
            listIds: [Number(env.BREVO_APP_LIST_ID)],
            updateEnabled: true,
          }),
        });

        if (!response.ok) {
          console.error("Brevo error", response.status, await response.text());
          return json({ error: "subscription_failed" }, 502);
        }

        return json({ ok: true }, 200);
      } catch {
        return json({ error: "bad_request" }, 400);
      }
    }

    return env.ASSETS.fetch(request);
  },
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
