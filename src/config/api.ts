/**
 * Endpoints de Edge Functions (proxies seguros para n8n).
 * Os webhooks n8n diretos NÃO são mais expostos no bundle.
 */
export const EDGE_FUNCTIONS = {
  VERIFY_MEDICO_PIN: "verify-medico-pin",
  SUBMIT_CADASTRO: "submit-cadastro",
  DASHBOARD_MEDICOS: "dashboard-medicos",
  ACAO_CADASTRO: "acao-cadastro",
} as const;
