export const READER_COOKIE = "lm_reader";
export const READER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

function toBase64Url(buf: ArrayBuffer) {
  return Buffer.from(buf).toString("base64url");
}

async function hmac(data: string) {
  const secret = process.env.READER_COOKIE_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("READER_COOKIE_SECRET must be set (at least 16 characters).");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkReaderPassword(input: string) {
  const expected = process.env.READER_PASSWORD;
  if (!expected) return false;
  // Compare HMACs so the comparison is constant-length.
  return safeEqual(await hmac(`pw:${input}`), await hmac(`pw:${expected}`));
}

/**
 * Token = "<expiry>.<signature>". The signature also covers the current password,
 * so changing READER_PASSWORD logs out every existing reader.
 */
export async function createReaderToken() {
  const exp = Math.floor(Date.now() / 1000) + READER_MAX_AGE;
  const sig = await hmac(`reader:${exp}:${process.env.READER_PASSWORD}`);
  return `${exp}.${sig}`;
}

export async function verifyReaderToken(token: string | undefined) {
  if (!token || !process.env.READER_PASSWORD) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(`reader:${exp}:${process.env.READER_PASSWORD}`));
}
