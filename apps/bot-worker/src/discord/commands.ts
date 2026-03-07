const Discord = require('discord.js');
// Type aliases for clarity; all Discord types are `any` in this isolated context
type Client = any;
type ApplicationCommandDataResolvable = any;
type ChatInputCommandInteraction = any;
const SlashCommandBuilder: any = Discord.SlashCommandBuilder;
import { verificationService } from '../services/verifyService';
import { ticketService } from '../services/ticketService';
import { logger } from '../logger';

/**
 * Register slash commands with the Discord API. Commands are registered for
 * the configured guild to allow for instant updates during development.
 */
export async function registerSlashCommands(client: Client, guildId: string): Promise<void> {
  const commands: ApplicationCommandDataResolvable[] = [
    new SlashCommandBuilder()
      .setName('verify')
      .setDescription('Verification related commands')
      .addSubcommand((sub: any) =>
        sub
          .setName('resend')
          .setDescription('Resend your verification link via DM')
      )
      .toJSON(),
    new SlashCommandBuilder()
      .setName('support')
      .setDescription('Create a support ticket')
      .addStringOption((opt: any) =>
        opt
          .setName('subject')
          .setDescription('Subject of your request')
          .setRequired(true)
      )
      .addStringOption((opt: any) =>
        opt
          .setName('message')
          .setDescription('Describe your issue')
          .setRequired(true)
      )
      .toJSON(),
  ];
  try {
    await client.application?.commands.set(commands, guildId);
    logger.info('Slash commands registered');
  } catch (err) {
    logger.error({ err }, 'Failed to register slash commands');
  }
}

/**
 * Dispatch a slash command interaction. Called from the interaction handler.
 */
export async function handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const { commandName } = interaction;
  if (commandName === 'verify') {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'resend') {
      const ok = await verificationService.resendVerification(interaction.user.id);
      if (ok) {
        await interaction.reply({ content: 'A new verification link has been sent to your DMs.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Unable to send you a DM. Please check your privacy settings.', ephemeral: true });
      }
    }
    return;
  }
  if (commandName === 'support') {
    const subject = interaction.options.getString('subject', true);
    const message = interaction.options.getString('message', true);
    // In the monorepo the userId will come from the session; here we pass null
    await ticketService.createTicket(interaction.user.id, null, subject, message);
    await interaction.reply({ content: 'Support ticket created. Our team will contact you shortly.', ephemeral: true });
    return;
  }
}