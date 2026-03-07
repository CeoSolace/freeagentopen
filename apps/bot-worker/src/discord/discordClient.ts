const Discord = require('discord.js');
import { env } from '../config';
import { logger } from '../logger';
import { verificationService } from '../services/verifyService';
import { registerSlashCommands, handleSlashCommand } from './commands';

/**
 * Initialize the Discord client with the appropriate intents and partials. The
 * client is exported so that other services can use it to interact with
 * Discord. Call `startDiscord()` from the entry point to connect.
 */
export const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.DirectMessages,
  ],
  partials: [Discord.Partials.Channel],
});

/**
 * Start the Discord bot by logging in and registering event handlers. When the
 * bot is ready it ensures that the verification message is present in the
 * configured channel. Interactions are forwarded to the verification
 * service.
 */
export async function startDiscord(): Promise<void> {
  client.once('ready', async () => {
    logger.info(`Discord bot logged in as ${client.user?.tag}`);
    // Ensure the persistent verification message is present
    await verificationService.ensureVerificationMessage();
    // Register slash commands on the guild
    try {
      await registerSlashCommands(client, env.DISCORD_GUILD_ID);
    } catch (err) {
      logger.error({ err }, 'Failed to register slash commands');
    }
  });
  client.on('interactionCreate', async (interaction: any) => {
    // Route button interactions to the verification service
    try {
      await verificationService.handleVerifyButton(interaction);
    } catch (err: any) {
      logger.error({ err }, 'Failed to handle interaction');
    }
    if (interaction.isChatInputCommand()) {
      try {
        await handleSlashCommand(interaction);
      } catch (err) {
        logger.error({ err }, 'Failed to handle slash command');
      }
    }
  });
  client.on('error', (err: any) => {
    logger.error({ err }, 'Discord client error');
  });
  try {
    await client.login(env.DISCORD_BOT_TOKEN);
  } catch (err) {
    logger.error({ err }, 'Failed to login to Discord');
    process.exit(1);
  }
}