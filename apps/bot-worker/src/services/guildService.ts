// Discord types are declared as any in the ambient module declarations, so we
// avoid importing specific type names here to prevent compile errors.
import { client } from '../discord/discordClient';
import { env } from '../config';
import { logger } from '../logger';

/**
 * GuildService encapsulates interactions with the Discord guild. All direct
 * Discord API calls are centralised here to simplify error handling and
 * permission checks. The guild ID is loaded from the environment.
 */
class GuildService {
  private get guild() {
    const guild = client.guilds.cache.get(env.DISCORD_GUILD_ID);
    if (!guild) {
      throw new Error('Guild not found');
    }
    return guild;
  }

  /**
   * Fetch a guild member by their Discord user ID. Returns undefined if the
   * member is not found in the guild.
   */
  async getMember(discordUserId: string): Promise<any | undefined> {
    try {
      const guild = this.guild;
      return await guild.members.fetch(discordUserId).catch(() => undefined);
    } catch (err) {
      logger.error({ err }, 'Failed to fetch guild member');
      return undefined;
    }
  }

  /**
   * Check whether a user is currently a member of the guild.
   */
  async isMember(discordUserId: string): Promise<boolean> {
    return !!(await this.getMember(discordUserId));
  }

  /**
   * Attempt to add a user to the guild using a valid OAuth access token. This
   * method should be called when a user has consented to auto join. If the
   * operation succeeds the member object is returned, otherwise undefined.
   */
  async addMember(discordUserId: string, accessToken: string): Promise<any | undefined> {
    try {
      const guild = this.guild;
      const member = await guild.members.add(discordUserId, {
        accessToken,
        roles: [env.DISCORD_MEMBER_ROLE_ID],
      });
      logger.info({ discordUserId }, 'Added member to guild');
      return member;
    } catch (err) {
      logger.error({ err }, 'Failed to add member to guild');
      return undefined;
    }
  }

  /**
   * Assign a role to a guild member. Does nothing if the member is not in the
   * guild. Returns true on success.
   */
  async assignRole(discordUserId: string, roleId: any): Promise<boolean> {
    const member = await this.getMember(discordUserId);
    if (!member) return false;
    try {
      await member.roles.add(roleId);
      return true;
    } catch (err) {
      logger.error({ err }, 'Failed to assign role');
      return false;
    }
  }

  /**
   * Remove a role from a guild member. Returns true on success.
   */
  async removeRole(discordUserId: string, roleId: any): Promise<boolean> {
    const member = await this.getMember(discordUserId);
    if (!member) return false;
    try {
      await member.roles.remove(roleId);
      return true;
    } catch (err) {
      logger.error({ err }, 'Failed to remove role');
      return false;
    }
  }

  /**
   * Ban a user from the guild with an optional reason. Returns true if the
   * operation succeeds.
   */
  async banMember(discordUserId: string, reason?: string): Promise<boolean> {
    try {
      const guild = this.guild;
      await guild.members.ban(discordUserId, { reason });
      logger.info({ discordUserId, reason }, 'Banned member from guild');
      return true;
    } catch (err) {
      logger.error({ err }, 'Failed to ban member');
      return false;
    }
  }

  /**
   * Unban a user from the guild. Returns true on success.
   */
  async unbanMember(discordUserId: string): Promise<boolean> {
    try {
      const guild = this.guild;
      await guild.members.unban(discordUserId);
      logger.info({ discordUserId }, 'Unbanned member from guild');
      return true;
    } catch (err) {
      logger.error({ err }, 'Failed to unban member');
      return false;
    }
  }
}

export const guildService = new GuildService();