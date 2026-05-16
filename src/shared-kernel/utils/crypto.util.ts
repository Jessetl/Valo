import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const REQUIRED_KEY_BYTES = 32;

let cachedKey: Buffer | null = null;

const decodeKey = (raw: string): Buffer => {
  const trimmed = raw.trim();
  if (!/^[A-Za-z0-9+/=_-]+$/.test(trimmed)) {
    throw new Error('APP_ENCRYPTION_KEY must be base64 (or base64url) encoded');
  }
  const normalized = trimmed.replace(/-/g, '+').replace(/_/g, '/');
  const buffer = Buffer.from(normalized, 'base64');
  if (buffer.length !== REQUIRED_KEY_BYTES) {
    throw new Error(
      `APP_ENCRYPTION_KEY must decode to exactly ${REQUIRED_KEY_BYTES} bytes ` +
        `(got ${buffer.length}). Generate with: openssl rand -base64 32`,
    );
  }
  return buffer;
};

const getKey = (): Buffer => {
  if (cachedKey) return cachedKey;
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('APP_ENCRYPTION_KEY env var is not configured');
  }
  cachedKey = decodeKey(raw);
  return cachedKey;
};

export const assertEncryptionKey = (): void => {
  getKey();
};

export const resetEncryptionKeyCacheForTests = (): void => {
  cachedKey = null;
};

export const encryptString = (plaintext: string): string => {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
};

export const decryptString = (payload: string): string => {
  const key = getKey();
  const buffer = Buffer.from(payload, 'base64');
  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return dec.toString('utf8');
};
