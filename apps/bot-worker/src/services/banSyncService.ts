import { guildService } from './guildService';
import { UserBan } from '../models/userBan';
import { logger } from '../logger';
import { banSyncEnabled, env } from '../config';
import { client } from '../discord/discordClient';

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
  async reconcileBans(): Promise<void> {
    if (!banSyncEnabled) return;
    const guild = client.guilds.cache.get(env.DISCORD_GUILD_ID);
    if (!guild) return;
    try {
      // Fetch all active bans from database
      const siteBans = await UserBan.find({ active: true, source: 'site' }).exec();
      // Fetch bans from Discord
      const discordBans = await guild.bans.fetch();
      const discordBanMap = new Map<string, string>();
      discordBans.forEach((ban: any) => {
        discordBanMap.set(ban.user.id, ban.reason ?? 'No reason');
      });
      // Ensure each site ban is reflected on Discord
      for (const ban of siteBans as any[]) {
        if (!discordBanMap.has(ban.discordUserId)) {
          await guildService.banMember(ban.discordUserId, ban.reason);
        }
      }
      // For each Discord ban, ensure DB record exists
      for (const [userId, reason] of discordBanMap as any) {
        const existing = await UserBan.findOne({ discordUserId: userId, active: true }).exec();
        if (!existing) {
          await UserBan.create({ discordUserId: userId, reason: reason || 'Unknown', active: true, source: 'discord' });
          logger.info({ userId }, 'Recorded Discord ban in database');
        }
      }
    } catch (err) {
      logger.error({ err }, 'Failed to reconcile bans');
    }
  }
}

export const banSyncService = new BanSyncService();