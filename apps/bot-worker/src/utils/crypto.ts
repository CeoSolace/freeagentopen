import crypto from 'crypto';
import { env } from '../config';

/**
 * Generate a random URL‑safe token. The token length defaults to 48 bytes
 * (resulting in a 64‑character base64 string) but can be increased. Tokens
 * should be short‑lived and are used for verification flows.
 */
export function generateToken(size = 48): string {
  return crypto.randomBytes(size).toString('base64url');
}

/**
 * Compute a SHA‑256 HMAC of a token using an optional encryption key. This
 * function ensures that tokens stored in the database are not reversible. If
 * no `TOKEN_ENCRYPTION_KEY` is provided the HMAC defaults to SHA‑256 of the
 * token itself. Use a secure key in production.
 */
export function hashToken(token: string): string {
  const key = env.TOKEN_ENCRYPTION_KEY || '';
  if (key) {
    return crypto.createHmac('sha256', key).update(token).digest('hex');
  }
  return crypto.createHash('sha256').update(token).digest('hex');
}