/**
 * Autenticacao simples de senha unica compartilhada para o sistema inteiro.
 * Nao ha contas por usuario - e um portao de acesso para a equipe (gerentes,
 * compradores, coordenadores), como descrito no handoff do produto.
 *
 * O token de sessao e um valor assinado (HMAC-SHA256) guardado em cookie httpOnly:
 *   "<timestamp_de_expiracao>.<assinatura>"
 * Usa apenas Web Crypto + TextEncoder para funcionar tanto no middleware
 * (Edge Runtime) quanto nas rotas de API (Node Runtime).
 */

export var SESSION_COOKIE_NAME = "martins_bi_session";
var SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

var encoder = new TextEncoder();

function getSecret(): string {
  // AUTH_SECRET e o ideal (chave de assinatura separada da senha).
  // Cai para APP_PASSWORD se AUTH_SECRET nao estiver configurada, para
  // simplificar o setup inicial - documentado no .env.example.
  return process.env.AUTH_SECRET || process.env.APP_PASSWORD || "";
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  var bytes = new Uint8Array(buffer);
  var binary = "";
  for (var i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  var base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string): Promise<string> {
  var secret = getSecret();
  var key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  var signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bufferToBase64Url(signature);
}

export async function createSessionToken(): Promise<string> {
  var expiresAt = Date.now() + SESSION_DURATION_MS;
  var signature = await hmac(String(expiresAt));
  return expiresAt + "." + signature;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  var parts = token.split(".");
  if (parts.length !== 2) return false;

  var expiresAt = Number(parts[0]);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  var expectedSignature = await hmac(String(expiresAt));
  return expectedSignature === parts[1];
}
