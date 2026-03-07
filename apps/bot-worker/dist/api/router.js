"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const auth_1 = require("../utils/auth");
const verifyService_1 = require("../services/verifyService");
const guildService_1 = require("../services/guildService");
const roleSyncService_1 = require("../services/roleSyncService");
const userBan_1 = require("../models/userBan");
const membershipService_1 = require("../services/membershipService");
const banSyncService_1 = require("../services/banSyncService");
const router = express.Router();
// Health check endpoint
router.get('/health', (_req, res) => {
    return res.json({ status: 'ok' });
});
/**
 * Complete Discord verification. The website posts the discordUserId and the
 * raw token. The service verifies the token and assigns the member role.
 */
router.post('/internal/discord/verify/complete', auth_1.requireInternalAuth, async (req, res) => {
    const { discordUserId, token } = req.body || {};
    if (!discordUserId || !token) {
        return res.status(400).json({ error: 'Missing discordUserId or token' });
    }
    const ok = await verifyService_1.verificationService.completeVerification(discordUserId, token);
    if (!ok) {
        return res.status(400).json({ error: 'Invalid or expired token' });
    }
    return res.json({ success: true });
});
// Get membership status of a Discord user
router.get('/internal/discord/member-status/:discordUserId', auth_1.requireInternalAuth, async (req, res) => {
    const { discordUserId } = req.params;
    const inGuild = await guildService_1.guildService.isMember(discordUserId);
    return res.json({ inGuild });
});
// Assign the member role to a user
router.post('/internal/discord/assign-member-role', auth_1.requireInternalAuth, async (req, res) => {
    const { discordUserId } = req.body || {};
    if (!discordUserId)
        return res.status(400).json({ error: 'Missing discordUserId' });
    const ok = await guildService_1.guildService.assignRole(discordUserId, process.env.DISCORD_MEMBER_ROLE_ID);
    return res.json({ success: ok });
});
// Sync a user's roles
router.post('/internal/discord/sync-user-roles', auth_1.requireInternalAuth, async (req, res) => {
    const { discordUserId } = req.body || {};
    if (!discordUserId)
        return res.status(400).json({ error: 'Missing discordUserId' });
    await roleSyncService_1.roleSyncService.syncUserRoles(discordUserId);
    return res.json({ success: true });
});
// Ban a Discord user from the guild and record the ban
router.post('/internal/discord/ban-user', auth_1.requireInternalAuth, async (req, res) => {
    const { discordUserId, reason } = req.body || {};
    if (!discordUserId)
        return res.status(400).json({ error: 'Missing discordUserId' });
    const ok = await guildService_1.guildService.banMember(discordUserId, reason);
    if (ok) {
        await userBan_1.UserBan.create({ discordUserId, reason: reason || 'No reason provided', active: true, source: 'site' });
    }
    return res.json({ success: ok });
});
// Unban a Discord user and mark ban inactive in DB
router.post('/internal/discord/unban-user', auth_1.requireInternalAuth, async (req, res) => {
    const { discordUserId } = req.body || {};
    if (!discordUserId)
        return res.status(400).json({ error: 'Missing discordUserId' });
    const ok = await guildService_1.guildService.unbanMember(discordUserId);
    if (ok) {
        await userBan_1.UserBan.updateMany({ discordUserId, active: true }, { active: false }).exec();
    }
    return res.json({ success: ok });
});
// Cron endpoints to trigger background jobs manually
router.post('/internal/jobs/run-membership-sync', auth_1.requireCronAuth, async (_req, res) => {
    await membershipService_1.membershipService.reconcileMemberships();
    return res.json({ success: true });
});
router.post('/internal/jobs/run-ban-sync', auth_1.requireCronAuth, async (_req, res) => {
    await banSyncService_1.banSyncService.reconcileBans();
    return res.json({ success: true });
});
router.post('/internal/jobs/run-role-sync', auth_1.requireCronAuth, async (_req, res) => {
    await roleSyncService_1.roleSyncService.syncAllUsers();
    return res.json({ success: true });
});
router.post('/internal/jobs/run-token-cleanup', auth_1.requireCronAuth, async (_req, res) => {
    await verifyService_1.verificationService.cleanupExpiredTokens();
    return res.json({ success: true });
});
exports.default = router;
