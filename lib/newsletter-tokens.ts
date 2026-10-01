type NewsletterTokenPurpose = "confirm" | "unsubscribe";
type Environment = Record<string, string | undefined>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxTokenLength = 2048;

function tokenError() {
  return new Error("Newsletter token configuration is unavailable.");
}

function validateSecret(secret: string | undefined): string {
  if (!secret || secret.length < 32 || /[\x00-\x1f\x7f]/.test(secret)) throw tokenError();
  return secret;
}

export function newsletterTokenSecret(env: Environment = process.env): string | undefined {
  const value = env.NEWSLETTER_TOKEN_SECRET;
  if (!value) return undefined;
  return validateSecret(value);
}

async function encryptionKey(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(validateSecret(secret)));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function encode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decode(value: string) {
  if (!value || value.length > maxTokenLength || !/^[A-Za-z0-9_-]+$/.test(value)) throw tokenError();
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function validEmail(email: unknown): email is string {
  return typeof email === "string"
    && email.length <= 254
    && emailPattern.test(email)
    && !Array.from(email).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
}

export async function createNewsletterToken(
  email: string,
  purpose: NewsletterTokenPurpose,
  secret: string,
  expiresAt: number,
) {
  if (!validEmail(email) || !Number.isSafeInteger(expiresAt) || expiresAt <= 0) throw tokenError();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify({ e: email, p: purpose, x: expiresAt }));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(secret), plaintext));
  const payload = new Uint8Array(1 + iv.length + ciphertext.length);
  payload[0] = 1;
  payload.set(iv, 1);
  payload.set(ciphertext, 13);
  return encode(payload);
}

export async function readNewsletterToken(
  token: string,
  expectedPurpose: NewsletterTokenPurpose,
  secret: string,
  now = Date.now(),
): Promise<string | undefined> {
  try {
    const payload = decode(token);
    if (payload.length < 30 || payload[0] !== 1) return undefined;
    const iv = payload.slice(1, 13);
    const ciphertext = payload.slice(13);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await encryptionKey(secret), ciphertext);
    const parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(plaintext)) as { e?: unknown; p?: unknown; x?: unknown };
    if (!validEmail(parsed.e) || parsed.p !== expectedPurpose || !Number.isSafeInteger(parsed.x) || (parsed.x as number) < now) return undefined;
    return parsed.e;
  } catch {
    return undefined;
  }
}
