"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.banSyncService = void 0;
const guildService_1 = require("./guildService");
const userBan_1 = require("../models/userBan");
const logger_1 = require("../logger");
const config_1 = require("../config");
const discordClient_1 = require("../discord/discordClient");
/**
 * BanSyncService keeps bans consistent between the website and Discord. It
 * periodically checks active bans in the database and ensures corresponding
 * bans exist on Discord, and vice versa. If a ban is lifted on one side it
 * reflects on the other. This service only runs when `DISCORD_BAN_SYNC_ENABLED`
 * is true.
 */
class BanSyncService {
    /**
     * Reconcile site bans with Discord bans. For each active site ban, ban the
     * user in Discord if they are not already banned. For each Discord ban, if
     * no corresponding DB record exists create one with source 'discord'.
     */
    async reconcileBans() {
        if (!config_1.banSyncEnabled)
            return;
        const guild = discordClient_1.client.guilds.cache.get(config_1.env.DISCORD_GUILD_ID);
        if (!guild)
            return;
        try {
            // Fetch all active bans from database
            const siteBans = await userBan_1.UserBan.find({ active: true, source: 'site' }).exec();
            // Fetch bans from Discord
            const discordBans = await guild.bans.fetch();
            const discordBanMap = new Map();
            discordBans.forEach((ban) => {
                discordBanMap.set(ban.user.id, ban.reason ?? 'No reason');
            });
            // Ensure each site ban is reflected on Discord
            for (const ban of siteBans) {
                if (!discordBanMap.has(ban.discordUserId)) {
                    await guildService_1.guildService.banMember(ban.discordUserId, ban.reason);
                }
            }
            // For each Discord ban, ensure DB record exists
            for (const [userId, reason] of discordBanMap) {
                const existing = await userBan_1.UserBan.findOne({ discordUserId: userId, active: true }).exec();
                if (!existing) {
                    await userBan_1.UserBan.create({ discordUserId: userId, reason: reason || 'Unknown', active: true, source: 'discord' });
                    logger_1.logger.info({ userId }, 'Recorded Discord ban in database');
                }
            }
        }
        catch (err) {
            logger_1.logger.error({ err }, 'Failed to reconcile bans');
        }
    }
}
exports.banSyncService = new BanSyncService();
