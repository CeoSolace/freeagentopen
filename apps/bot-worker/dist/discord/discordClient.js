"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
exports.startDiscord = startDiscord;
const Discord = require('discord.js');
const config_1 = require("../config");
const logger_1 = require("../logger");
const verifyService_1 = require("../services/verifyService");
const commands_1 = require("./commands");
/**
 * Initialize the Discord client with the appropriate intents and partials. The
 * client is exported so that other services can use it to interact with
 * Discord. Call `startDiscord()` from the entry point to connect.
 */
exports.client = new Discord.Client({
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
async function startDiscord() {
    exports.client.once('ready', async () => {
        logger_1.logger.info(`Discord bot logged in as ${exports.client.user?.tag}`);
        // Ensure the persistent verification message is present
        await verifyService_1.verificationService.ensureVerificationMessage();
        // Register slash commands on the guild
        try {
            await (0, commands_1.registerSlashCommands)(exports.client, config_1.env.DISCORD_GUILD_ID);
        }
        catch (err) {
            logger_1.logger.error({ err }, 'Failed to register slash commands');
        }
    });
    exports.client.on('interactionCreate', async (interaction) => {
        // Route button interactions to the verification service
        try {
            await verifyService_1.verificationService.handleVerifyButton(interaction);
        }
        catch (err) {
            logger_1.logger.error({ err }, 'Failed to handle interaction');
        }
        if (interaction.isChatInputCommand()) {
            try {
                await (0, commands_1.handleSlashCommand)(interaction);
            }
            catch (err) {
                logger_1.logger.error({ err }, 'Failed to handle slash command');
            }
        }
    });
    exports.client.on('error', (err) => {
        logger_1.logger.error({ err }, 'Discord client error');
    });
    try {
        await exports.client.login(config_1.env.DISCORD_BOT_TOKEN);
    }
    catch (err) {
        logger_1.logger.error({ err }, 'Failed to login to Discord');
        process.exit(1);
    }
}
