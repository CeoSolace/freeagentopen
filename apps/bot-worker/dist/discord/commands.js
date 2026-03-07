"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSlashCommands = registerSlashCommands;
exports.handleSlashCommand = handleSlashCommand;
const Discord = require('discord.js');
const SlashCommandBuilder = Discord.SlashCommandBuilder;
const verifyService_1 = require("../services/verifyService");
const ticketService_1 = require("../services/ticketService");
const logger_1 = require("../logger");
/**
 * Register slash commands with the Discord API. Commands are registered for
 * the configured guild to allow for instant updates during development.
 */
async function registerSlashCommands(client, guildId) {
    const commands = [
        new SlashCommandBuilder()
            .setName('verify')
            .setDescription('Verification related commands')
            .addSubcommand((sub) => sub
            .setName('resend')
            .setDescription('Resend your verification link via DM'))
            .toJSON(),
        new SlashCommandBuilder()
            .setName('support')
            .setDescription('Create a support ticket')
            .addStringOption((opt) => opt
            .setName('subject')
            .setDescription('Subject of your request')
            .setRequired(true))
            .addStringOption((opt) => opt
            .setName('message')
            .setDescription('Describe your issue')
            .setRequired(true))
            .toJSON(),
    ];
    try {
        await client.application?.commands.set(commands, guildId);
        logger_1.logger.info('Slash commands registered');
    }
    catch (err) {
        logger_1.logger.error({ err }, 'Failed to register slash commands');
    }
}
/**
 * Dispatch a slash command interaction. Called from the interaction handler.
 */
async function handleSlashCommand(interaction) {
    const { commandName } = interaction;
    if (commandName === 'verify') {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'resend') {
            const ok = await verifyService_1.verificationService.resendVerification(interaction.user.id);
            if (ok) {
                await interaction.reply({ content: 'A new verification link has been sent to your DMs.', ephemeral: true });
            }
            else {
                await interaction.reply({ content: 'Unable to send you a DM. Please check your privacy settings.', ephemeral: true });
            }
        }
        return;
    }
    if (commandName === 'support') {
        const subject = interaction.options.getString('subject', true);
        const message = interaction.options.getString('message', true);
        // In the monorepo the userId will come from the session; here we pass null
        await ticketService_1.ticketService.createTicket(interaction.user.id, null, subject, message);
        await interaction.reply({ content: 'Support ticket created. Our team will contact you shortly.', ephemeral: true });
        return;
    }
}
