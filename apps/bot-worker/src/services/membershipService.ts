import { User } from '../models/user';
import { guildService } from './guildService';
import { verificationService } from './verifyService';
import { logger } from '../logger';

/**
 * MembershipService attempts to reconcile guild membership for users who have
 * consented to auto join. In a production environment this would use the
 * Discord OAuth access token saved during sign‑in to add the user to the
 * guild. Since access tokens are not available in this context the service
 * simply assigns the member role to existing guild members and logs users
 * who need to join manually.
 */
class MembershipService {
  /**
   * Iterate through users with auto join consent and ensure they are in the
   * guild with the member role. If a user is not yet in the guild then a
   * verification link is resent to encourage manual join.
   */
  async reconcileMemberships(): Promise<void> {
    const users = await User.find({ autoJoinConsent: true, verified: true }).exec();
    for (const user of users) {
      const inGuild = await guildService.isMember(user.discordId);
      if (!inGuild) {
        // Without OAuth tokens we cannot add the member, so DM them a reminder
        await verificationService.resendVerification(user.discordId);
        logger.info({ discordUserId: user.discordId }, 'User not in guild during membership sync');
      } else {
        // Ensure they have member role assigned
        await guildService.assignRole(user.discordId, process.env.DISCORD_MEMBER_ROLE_ID!);
        await User.updateOne({ _id: user._id }, { memberRoleAssigned: true }).exec();
      }
    }
  }
}

export const membershipService = new MembershipService();