"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.membershipService = void 0;
const user_1 = require("../models/user");
const guildService_1 = require("./guildService");
const verifyService_1 = require("./verifyService");
const logger_1 = require("../logger");
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
    async reconcileMemberships() {
        const users = await user_1.User.find({ autoJoinConsent: true, verified: true }).exec();
        for (const user of users) {
            const inGuild = await guildService_1.guildService.isMember(user.discordId);
            if (!inGuild) {
                // Without OAuth tokens we cannot add the member, so DM them a reminder
                await verifyService_1.verificationService.resendVerification(user.discordId);
                logger_1.logger.info({ discordUserId: user.discordId }, 'User not in guild during membership sync');
            }
            else {
                // Ensure they have member role assigned
                await guildService_1.guildService.assignRole(user.discordId, process.env.DISCORD_MEMBER_ROLE_ID);
                await user_1.User.updateOne({ _id: user._id }, { memberRoleAssigned: true }).exec();
            }
        }
    }
}
exports.membershipService = new MembershipService();
