"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketService = void 0;
const ticket_1 = require("../models/ticket");
const ticketMessage_1 = require("../models/ticketMessage");
const discordClient_1 = require("../discord/discordClient");
const logger_1 = require("../logger");
/**
 * TicketService provides helper functions for creating and updating support
 * tickets and notifying users via DM. The actual slash command definitions
 * live in the bot handler. In a full implementation this would integrate
 * deeply with the website's support system.
 */
class TicketService {
    /**
     * Create a new support ticket with an initial message.
     */
    async createTicket(discordUserId, userId, subject, content) {
        try {
            const ticket = await ticket_1.Ticket.create({ userId, discordUserId, subject, status: 'open' });
            await ticketMessage_1.TicketMessage.create({ ticketId: ticket._id, author: 'user', discordUserId, content });
            // Optionally notify support staff via a dedicated channel
            logger_1.logger.info({ ticketId: ticket._id }, 'Created support ticket');
            await this.notifyUser(discordUserId, `Your support ticket has been created. Subject: ${subject}`);
        }
        catch (err) {
            logger_1.logger.error({ err }, 'Failed to create support ticket');
        }
    }
    /**
     * Append a message to an existing ticket. When a support agent replies via
     * the website the worker can send a DM update to the user.
     */
    async addMessage(ticketId, author, discordUserId, content) {
        try {
            const message = await ticketMessage_1.TicketMessage.create({ ticketId, author, discordUserId, content });
            const ticket = await ticket_1.Ticket.findById(ticketId).exec();
            if (!ticket)
                return;
            if (author === 'support') {
                await this.notifyUser(ticket.discordUserId, `Support replied: ${content}`);
            }
            logger_1.logger.info({ ticketId }, 'Added message to ticket');
        }
        catch (err) {
            logger_1.logger.error({ err }, 'Failed to add ticket message');
        }
    }
    /**
     * Notify a user via DM if possible. Returns false if the DM fails (e.g.
     * because the user has DMs disabled).
     */
    async notifyUser(discordUserId, message) {
        try {
            const user = await discordClient_1.client.users.fetch(discordUserId);
            if (!user)
                return false;
            await user.send(message);
            return true;
        }
        catch (err) {
            logger_1.logger.warn({ err }, 'Failed to notify user via DM');
            return false;
        }
    }
}
exports.ticketService = new TicketService();
