import { createHash, randomBytes, timingSafeEqual } from "crypto";

export interface OwnerTokenPair {
  token: string;
  hash: string;
}

/** 32바이트 랜덤(hex 64자) owner token 생성 + sha256 해시 반환. 원문은 DB에 저장하지 않는다. */
export function generateOwnerToken(): OwnerTokenPair {
  const token = randomBytes(32).toString("hex");
  return { token, hash: sha256Hash(token) };
}

export function sha256Hash(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** 저장된 해시와 제출된 토큰 비교 (타이밍 공격 완화) */
export function verifyOwnerToken(token: string, storedHash: string): boolean {
  try {
    const h = sha256Hash(token);
    const a = Buffer.from(h, "hex");
    const b = Buffer.from(storedHash, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** publicId: nanoid 유사 6자 영숫자 랜덤 */
const PUBLIC_ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generatePublicId(length = 6): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PUBLIC_ID_ALPHABET[bytes[i] % PUBLIC_ID_ALPHABET.length];
  }
  return out;
}
