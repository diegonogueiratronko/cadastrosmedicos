/**
 * Endpoints n8n (chamada direta enquanto edge functions não estão deployadas).
 */
export const N8N_WEBHOOKS = {
  CADASTRO_MEDICO: "https://tronkoinovacao.app.n8n.cloud/webhook/cadastro-medico",
  DASHBOARD_MEDICOS: "https://tronkoinovacao.app.n8n.cloud/webhook/dashboard-medicos",
  ACAO_CADASTRO: "https://tronkoinovacao.app.n8n.cloud/webhook/acao-cadastro",
} as const;

export const MEDICO_SENHAS = ["2026"] as const;
