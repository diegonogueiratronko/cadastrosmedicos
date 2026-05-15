import { corsHeaders } from "../_shared/cors.ts";
import { signMedicoToken } from "../_shared/jwt.ts";

// verify-medico-pin: valida PIN e emite JWT curto
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const pin = typeof body?.pin === "string" ? body.pin.trim() : "";

    if (!pin) {
      return new Response(JSON.stringify({ error: "PIN obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pinsRaw = Deno.env.get("MEDICO_PINS") ?? "";
    const pins = pinsRaw.split(",").map((p) => p.trim()).filter(Boolean);

    if (!pins.includes(pin)) {
      return new Response(JSON.stringify({ error: "PIN inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secret = Deno.env.get("MEDICO_TOKEN_SECRET");
    if (!secret) {
      return new Response(JSON.stringify({ error: "Servidor mal configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await signMedicoToken(secret, 60 * 30); // 30 min
    return new Response(JSON.stringify({ token, expires_in: 1800 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Erro inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
