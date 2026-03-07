import { RoleMapping } from '../models/roleMapping';
import { User } from '../models/user';
import { guildService } from './guildService';
import { logger } from '../logger';
import { env, roleSyncEnabled } from '../config';
import { client } from '../discord/discordClient';

/**
 * RoleSyncService keeps Discord roles in sync with the site roles. It can
 * optionally create missing roles in the guild and remove roles that are no
 * longer mapped. Synchronisation is only performed if the feature flag
 * `DISCORD_ROLE_SYNC_ENABLED` is enabled.
 */
class RoleSyncService {
  /**
   * Synchronise a single user's Discord roles based on their site roles. For
   * each site role, find the Discord role ID via RoleMapping and assign it.
   * Unassign roles that are mapped but not in the user's site roles.
   */
  async syncUserRoles(discordUserId: string): Promise<void> {
    if (!roleSyncEnabled) return;
    const user = await User.findOne({ discordId: discordUserId }).exec();
    if (!user) return;
    const member = await guildService.getMember(discordUserId);
    if (!member) return;
    const mappings = await RoleMapping.find().exec();
    // Determine which Discord roles correspond to the user's site roles
    const desiredRoleIds = new Set<string>();
    for (const siteRole of user.roles) {
      const mapping = mappings.find((m: any) => m.siteRole === siteRole);
      if (mapping) desiredRoleIds.add(mapping.discordRoleId);
    }
    // Current roles on member that are managed by the role sync service
    const managedRoleIds = mappings.map((m: any) => m.discordRoleId);
    const currentManagedRoles = member.roles.cache.filter((r: any) => managedRoleIds.includes(r.id));
    // Add missing roles
    for (const roleId of desiredRoleIds) {
      if (!currentManagedRoles.some((r: any) => r.id === roleId)) {
        try {
          await member.roles.add(roleId);
        } catch (err) {
          logger.error({ err }, 'Failed to add role during sync');
        }
      }
    }
    // Remove roles that should no longer be present
    for (const role of currentManagedRoles.values() as any) {
      if (!desiredRoleIds.has(role.id)) {
        try {
          await member.roles.remove(role);
        } catch (err: any) {
          logger.error({ err }, 'Failed to remove role during sync');
        }
      }
    }
  }

  /**
   * Iterate over all users and synchronise their roles. Use with caution on
   * large guilds; this operation may take a while and hit rate limits. It is
   * recommended to run this periodically via a scheduled job.
   */
  async syncAllUsers(): Promise<void> {
    if (!roleSyncEnabled) return;
    const users = await User.find({}).exec();
    for (const user of users) {
      await this.syncUserRoles(user.discordId);
    }
  }

  /**
   * Ensure that every RoleMapping has a corresponding role in Discord. If a
   * role is missing, attempt to create it. Only runs when sync is enabled.
   */
  async ensureMappedRoles(): Promise<void> {
    if (!roleSyncEnabled) return;
    const guild = client.guilds.cache.get(env.DISCORD_GUILD_ID);
    if (!guild) return;
    const mappings = await RoleMapping.find().exec();
    const roles: any = await guild.roles.fetch();
    for (const mapping of mappings) {
      if (!roles.some((r: any) => r.id === mapping.discordRoleId)) {
        // Create a new role with the site role name
        try {
          const newRole = await guild.roles.create({
            name: mapping.siteRole,
            mentionable: false,
            color: 'Blue',
          });
          mapping.discordRoleId = newRole.id;
          await mapping.save();
          logger.info({ siteRole: mapping.siteRole, roleId: newRole.id }, 'Created missing Discord role');
        } catch (err: any) {
          logger.error({ err }, 'Failed to create missing role');
        }
      }
    }
  }
}

export const roleSyncService = new RoleSyncService();