import { corsHeaders } from "../_shared/cors.ts";
import { verifyMedicoToken } from "../_shared/jwt.ts";

const N8N_URL = "https://tronkoinovacao.app.n8n.cloud/webhook/cadastro-medico";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const token = req.headers.get("x-medico-token") ?? "";
  const secret = Deno.env.get("MEDICO_TOKEN_SECRET")!;
  const valid = await verifyMedicoToken(token, secret);
  if (!valid) {
    return new Response(JSON.stringify({ error: "Sessão expirada. Volte e digite o PIN novamente." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const n8nSecret = Deno.env.get("N8N_SHARED_SECRET")!;
  const formData = await req.formData();

  const upstream = await fetch(N8N_URL, {
    method: "POST",
    headers: { "X-N8N-Secret": n8nSecret },
    body: formData,
  });

  const text = await upstream.text();
  return new Response(text || JSON.stringify({ sucesso: upstream.ok }), {
    status: upstream.status,
    headers: {
      ...corsHeaders,
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
    },
  });
});
