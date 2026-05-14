import { createClient } from "npm:@supabase/supabase-js@2.45.0";

export async function requireAdmin(req: Request): Promise<
  | { ok: true; userId: string; nome: string; email: string }
  | { ok: false; status: number; error: string }
> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Missing Authorization header" };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error } = await supabase.auth.getClaims(token);
  if (error || !claims?.claims?.sub) {
    return { ok: false, status: 401, error: "Invalid token" };
  }

  const userId = claims.claims.sub as string;
  const email = (claims.claims.email as string) ?? "";

  const { data: profile, error: pErr } = await supabase
    .schema("udc")
    .from("user_profiles")
    .select("nome_completo, role, ativo")
    .eq("id", userId)
    .single();

  if (pErr || !profile) {
    return { ok: false, status: 403, error: "Profile not found" };
  }
  if (!profile.ativo) {
    return { ok: false, status: 403, error: "Account inactive" };
  }
  if (profile.role !== "admin" && profile.role !== "analista") {
    return { ok: false, status: 403, error: "Insufficient permissions" };
  }

  return { ok: true, userId, nome: profile.nome_completo, email };
}
