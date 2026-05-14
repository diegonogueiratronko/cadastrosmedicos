import { corsHeaders } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/admin.ts";

const N8N_URL = "https://tronkoinovacao.app.n8n.cloud/webhook/dashboard-medicos";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const n8nSecret = Deno.env.get("N8N_SHARED_SECRET")!;
  const url = `${N8N_URL}?t=${Date.now()}`;
  const upstream = await fetch(url, {
    method: "GET",
    headers: { "X-N8N-Secret": n8nSecret, "Cache-Control": "no-cache" },
  });

  const text = await upstream.text();
  return new Response(text || "{}", {
    status: upstream.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
