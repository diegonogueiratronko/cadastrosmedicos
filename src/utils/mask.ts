/**
 * Máscaras de exibição para dados sensíveis.
 * Mantém apenas o início para identificação visual; o restante vira ****.
 * Os dados originais NÃO são alterados — só a exibição.
 */

const onlyDigits = (v: string) => (v || "").replace(/\D/g, "");

export function maskCpf(cpf: string): string {
  const d = onlyDigits(cpf);
  if (d.length < 3) return cpf || "—";
  return `${d.slice(0, 3)}.***.***-**`;
}

export function maskCnpj(cnpj: string): string {
  const d = onlyDigits(cnpj);
  if (d.length < 2) return cnpj || "—";
  return `${d.slice(0, 2)}.***.***/****-**`;
}

export function maskRg(rg: string): string {
  const v = (rg || "").trim();
  if (v.length <= 2) return v || "—";
  return `${v.slice(0, 2)}${"*".repeat(Math.max(v.length - 2, 5))}`;
}

export function maskEmail(email: string): string {
  const v = (email || "").trim();
  if (!v.includes("@")) return v || "—";
  const [user, domain] = v.split("@");
  const userMasked = user.length <= 2
    ? user[0] + "*"
    : `${user.slice(0, 2)}${"*".repeat(Math.max(user.length - 2, 3))}`;
  return `${userMasked}@${domain}`;
}

export function maskTelefone(tel: string): string {
  const d = onlyDigits(tel);
  if (d.length < 4) return tel || "—";
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d[2]}****-****`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ****-****`;
  return `${d.slice(0, 2)}${"*".repeat(d.length - 2)}`;
}

export function maskGenerico(valor: string, manter = 2): string {
  const v = (valor || "").trim();
  if (!v) return "—";
  if (v.length <= manter) return v;
  return `${v.slice(0, manter)}${"*".repeat(Math.max(v.length - manter, 4))}`;
}

export function maskNome(nome: string): string {
  // Nome fica visível — útil pra equipe identificar. Apenas trim.
  return (nome || "").trim() || "—";
}
