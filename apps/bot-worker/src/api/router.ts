const express = require('express');
type Request = any;
type Response = any;
import { requireInternalAuth, requireCronAuth } from '../utils/auth';
import { verificationService } from '../services/verifyService';
import { guildService } from '../services/guildService';
import { roleSyncService } from '../services/roleSyncService';
import { UserBan } from '../models/userBan';
import { membershipService } from '../services/membershipService';
import { banSyncService } from '../services/banSyncService';
import { logger } from '../logger';

const router = express.Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok' });
});

/**
 * Complete Discord verification. The website posts the discordUserId and the
 * raw token. The service verifies the token and assigns the member role.
 */
router.post('/internal/discord/verify/complete', requireInternalAuth, async (req: Request, res: Response) => {
  const { discordUserId, token } = req.body || {};
  if (!discordUserId || !token) {
    return res.status(400).json({ error: 'Missing discordUserId or token' });
  }
  const ok = await verificationService.completeVerification(discordUserId, token);
  if (!ok) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  return res.json({ success: true });
});

// Get membership status of a Discord user
router.get('/internal/discord/member-status/:discordUserId', requireInternalAuth, async (req: Request, res: Response) => {
  const { discordUserId } = req.params;
  const inGuild = await guildService.isMember(discordUserId);
  return res.json({ inGuild });
});

// Assign the member role to a user
router.post('/internal/discord/assign-member-role', requireInternalAuth, async (req: Request, res: Response) => {
  const { discordUserId } = req.body || {};
  if (!discordUserId) return res.status(400).json({ error: 'Missing discordUserId' });
  const ok = await guildService.assignRole(discordUserId, process.env.DISCORD_MEMBER_ROLE_ID!);
  return res.json({ success: ok });
});

// Sync a user's roles
router.post('/internal/discord/sync-user-roles', requireInternalAuth, async (req: Request, res: Response) => {
  const { discordUserId } = req.body || {};
  if (!discordUserId) return res.status(400).json({ error: 'Missing discordUserId' });
  await roleSyncService.syncUserRoles(discordUserId);
  return res.json({ success: true });
});

// Ban a Discord user from the guild and record the ban
router.post('/internal/discord/ban-user', requireInternalAuth, async (req: Request, res: Response) => {
  const { discordUserId, reason } = req.body || {};
  if (!discordUserId) return res.status(400).json({ error: 'Missing discordUserId' });
  const ok = await guildService.banMember(discordUserId, reason);
  if (ok) {
    await UserBan.create({ discordUserId, reason: reason || 'No reason provided', active: true, source: 'site' });
  }
  return res.json({ success: ok });
});

// Unban a Discord user and mark ban inactive in DB
router.post('/internal/discord/unban-user', requireInternalAuth, async (req: Request, res: Response) => {
  const { discordUserId } = req.body || {};
  if (!discordUserId) return res.status(400).json({ error: 'Missing discordUserId' });
  const ok = await guildService.unbanMember(discordUserId);
  if (ok) {
    await UserBan.updateMany({ discordUserId, active: true }, { active: false }).exec();
  }
  return res.json({ success: ok });
});

// Cron endpoints to trigger background jobs manually
router.post('/internal/jobs/run-membership-sync', requireCronAuth, async (_req: Request, res: Response) => {
  await membershipService.reconcileMemberships();
  return res.json({ success: true });
});
router.post('/internal/jobs/run-ban-sync', requireCronAuth, async (_req: Request, res: Response) => {
  await banSyncService.reconcileBans();
  return res.json({ success: true });
});
router.post('/internal/jobs/run-role-sync', requireCronAuth, async (_req: Request, res: Response) => {
  await roleSyncService.syncAllUsers();
  return res.json({ success: true });
});
router.post('/internal/jobs/run-token-cleanup', requireCronAuth, async (_req: Request, res: Response) => {
  await verificationService.cleanupExpiredTokens();
  return res.json({ success: true });
});

export default router;