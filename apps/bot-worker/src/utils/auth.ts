import { Request, Response, NextFunction } from 'express';
import { env } from '../config';

/**
 * Validate internal API calls by checking the Authorization header. The header
 * must be of the form `Bearer <secret>` and the secret must match
 * `INTERNAL_SHARED_SECRET`. If the secret is missing or invalid a 401
 * response is sent.
 */
export function requireInternalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return void res.status(401).json({ error: 'Missing authorization header' });
  }
  const token = authHeader.substring('Bearer '.length);
  if (token !== env.INTERNAL_SHARED_SECRET) {
    return void res.status(401).json({ error: 'Invalid secret' });
  }
  next();
}

/**
 * Validate job/cron API calls using the `x-cron-secret` header. This header
 * must match `CRON_SECRET`. If invalid, respond with 401. This allows
 * scheduled jobs to be triggered only by trusted callers (e.g. Render cron).
 */
export function requireCronAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-cron-secret'] as string | undefined;
  if (!secret) {
    return void res.status(401).json({ error: 'Missing cron secret header' });
  }
  if (secret !== env.CRON_SECRET) {
    return void res.status(401).json({ error: 'Invalid cron secret' });
  }
  next();
}