// Minimal HS256 JWT sign/verify using Web Crypto (no deps)

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64u(bytes: Uint8Array | string): string {
  const bin = typeof bytes === "string" ? bytes : String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64uDecode(str: string): Uint8Array {
  const pad = "=".repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function key(secret: string) {
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signMedicoToken(secret: string, ttlSeconds = 900): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: "medico", iat: now, exp: now + ttlSeconds };
  const head = b64u(enc.encode(JSON.stringify(header)));
  const body = b64u(enc.encode(JSON.stringify(payload)));
  const data = `${head}.${body}`;
  const sig = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(data));
  return `${data}.${b64u(new Uint8Array(sig))}`;
}

export async function verifyMedicoToken(token: string, secret: string): Promise<boolean> {
  try {
    const [head, body, sig] = token.split(".");
    if (!head || !body || !sig) return false;
    const data = `${head}.${body}`;
    const ok = await crypto.subtle.verify(
      "HMAC",
      await key(secret),
      b64uDecode(sig),
      enc.encode(data),
    );
    if (!ok) return false;
    const payload = JSON.parse(dec.decode(b64uDecode(body)));
    if (typeof payload.exp !== "number") return false;
    if (Math.floor(Date.now() / 1000) >= payload.exp) return false;
    return payload.sub === "medico";
  } catch {
    return false;
  }
}
