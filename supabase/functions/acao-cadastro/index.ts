import { corsHeaders } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/admin.ts";

const N8N_URL = "https://tronkoinovacao.app.n8n.cloud/webhook/acao-cadastro";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Body JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const novoStatus = String(body?.novo_status ?? "");
  if (!["OK", "ERRO", "INATIVO", "PENDENTE"].includes(novoStatus)) {
    return new Response(JSON.stringify({ error: "novo_status inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!body?.id_unico && body?.numero_cadastro == null) {
    return new Response(JSON.stringify({ error: "id_unico ou numero_cadastro obrigatório" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Sobrescreve atualizado_por com identidade do servidor (anti-spoofing)
  const payload = {
    numero_cadastro: body.numero_cadastro ?? null,
    id_unico: body.id_unico ?? "",
    novo_status: novoStatus,
    motivo: String(body?.motivo ?? ""),
    atualizado_por: auth.nome || auth.email || "admin",
  };

  const n8nSecret = Deno.env.get("N8N_SHARED_SECRET")!;
  const upstream = await fetch(N8N_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-N8N-Secret": n8nSecret,
    },
    body: JSON.stringify(payload),
  });

  const text = await upstream.text();
  return new Response(text || JSON.stringify({ sucesso: upstream.ok }), {
    status: upstream.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
