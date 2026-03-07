const Discord = require('discord.js');
// Discord classes used at runtime; type definitions are treated as any
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = Discord;
import { env } from '../config';
import { client } from '../discord/discordClient';
import { logger } from '../logger';
import { generateToken, hashToken } from '../utils/crypto';
import { DiscordVerifyToken } from '../models/discordVerifyToken';
import { User } from '../models/user';
import { guildService } from './guildService';

/**
 * VerificationService orchestrates the Discord verification flow: it posts the
 * persistent verification message, handles button interactions, generates
 * tokens and validates them when the website calls the internal API.
 */
class VerificationService {
  private verifyButtonCustomId = 'verifyButton';

  /**
   * Ensure that the verification message exists in the configured channel. If a
   * previous message is found that contains the verify button then no action
   * is taken. Otherwise a new message is posted.
   */
  async ensureVerificationMessage(): Promise<void> {
    const channel: any = await client.channels.fetch(env.DISCORD_VERIFY_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) {
      logger.error('Verify channel not found or not text based');
      return;
    }
    try {
      const messages = await channel.messages.fetch({ limit: 50 });
      const existing = messages.find((msg: any) => {
        if (msg.author.id !== client.user?.id) return false;
        return msg.components.some((row: any) =>
          row.components.some((comp: any) => comp.customId === this.verifyButtonCustomId)
        );
      });
      if (existing) {
        logger.info('Verification message already present');
        return;
      }
      // Build button component
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(this.verifyButtonCustomId)
          .setLabel('Verify on Website')
          .setStyle(ButtonStyle.Primary)
      );
      await channel.send({
        content: 'Welcome to FreeAgentsLTD! Click the button below to verify your account on the website.',
        components: [row],
      });
      logger.info('Sent new verification message');
    } catch (err) {
      logger.error({ err }, 'Failed to ensure verification message');
    }
  }

  /**
   * Handle a button interaction from the verification message. Generates a
   * one‑time token, stores its hash in the database, and responds to the
   * interaction with a link to the website verification page. The response is
   * sent ephemerally to avoid cluttering the channel.
   */
  async handleVerifyButton(interaction: any): Promise<void> {
    if (!interaction.isButton()) return;
    if (interaction.customId !== this.verifyButtonCustomId) return;
    const discordUserId = interaction.user.id;
    try {
      const token = generateToken(32);
      const tokenHash = hashToken(token);
      // expire tokens after 15 minutes
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await DiscordVerifyToken.create({
        discordUserId,
        tokenHash,
        expiresAt,
      });
      const verifyUrl = `${env.APP_URL}/verify/discord?token=${encodeURIComponent(token)}`;
      await interaction.reply({
        content: `Your verification link: ${verifyUrl}`,
        components: [],
        // respond ephemerally so only the user sees the link
        ephemeral: true,
      });
      logger.info({ discordUserId }, 'Issued verification token');
    } catch (err) {
      logger.error({ err }, 'Failed to handle verify button');
      if (interaction.isRepliable()) {
        await interaction.reply({ content: 'Failed to generate verification link. Please try again later.', ephemeral: true });
      }
    }
  }

  /**
   * Complete the verification process. Called by the website via the internal
   * API when a logged‑in user returns with a token. Validates the token,
   * ensures it matches the Discord user, marks the user as verified and
   * assigns the Discord member role. Returns true if verification succeeds.
   */
  async completeVerification(discordUserId: string, token: string): Promise<boolean> {
    const tokenHash = hashToken(token);
    const record = await DiscordVerifyToken.findOne({ discordUserId, tokenHash }).exec();
    if (!record) {
      return false;
    }
    if (record.expiresAt.getTime() < Date.now()) {
      await record.deleteOne();
      return false;
    }
    // Remove token to prevent reuse
    await record.deleteOne();
    // Mark user verified
    const user = await User.findOneAndUpdate(
      { discordId: discordUserId },
      { verified: true },
      { upsert: true, new: true }
    ).exec();
    // Assign member role
    await guildService.assignRole(discordUserId, env.DISCORD_MEMBER_ROLE_ID);
    await User.updateOne({ discordId: discordUserId }, { memberRoleAssigned: true }).exec();
    logger.info({ discordUserId }, 'Verification completed via website');
    return true;
  }

  /**
   * Resend a verification link to a user via DM. Generates a new token and
   * sends it privately. If DMs are closed the promise resolves false.
   */
  async resendVerification(discordUserId: string): Promise<boolean> {
    try {
      const user = await client.users.fetch(discordUserId);
      if (!user) return false;
      const token = generateToken(32);
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await DiscordVerifyToken.create({ discordUserId, tokenHash, expiresAt });
      const verifyUrl = `${env.APP_URL}/verify/discord?token=${encodeURIComponent(token)}`;
      await user.send(`Here is your new verification link: ${verifyUrl}`);
      logger.info({ discordUserId }, 'Resent verification link via DM');
      return true;
    } catch (err) {
      logger.warn({ err }, 'Failed to resend verification DM');
      return false;
    }
  }

  /**
   * Delete any expired verification tokens from the database. This should be
   * called periodically by a cleanup job to prevent the token collection from
   * growing indefinitely.
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await DiscordVerifyToken.deleteMany({ expiresAt: { $lt: new Date() } }).exec();
      if (result.deletedCount && result.deletedCount > 0) {
        logger.info({ deleted: result.deletedCount }, 'Cleaned up expired verification tokens');
      }
    } catch (err) {
      logger.error({ err }, 'Failed to clean up verification tokens');
    }
  }
}

export const verificationService = new VerificationService();