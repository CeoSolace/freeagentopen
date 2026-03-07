import { Ticket } from '../models/ticket';
import { TicketMessage } from '../models/ticketMessage';
import { client } from '../discord/discordClient';
import { logger } from '../logger';

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
  async createTicket(discordUserId: string, userId: any, subject: string, content: string): Promise<void> {
    try {
      const ticket = await Ticket.create({ userId, discordUserId, subject, status: 'open' });
      await TicketMessage.create({ ticketId: ticket._id, author: 'user', discordUserId, content });
      // Optionally notify support staff via a dedicated channel
      logger.info({ ticketId: ticket._id }, 'Created support ticket');
      await this.notifyUser(discordUserId, `Your support ticket has been created. Subject: ${subject}`);
    } catch (err) {
      logger.error({ err }, 'Failed to create support ticket');
    }
  }

  /**
   * Append a message to an existing ticket. When a support agent replies via
   * the website the worker can send a DM update to the user.
   */
  async addMessage(ticketId: any, author: 'user' | 'support', discordUserId: string | undefined, content: string): Promise<void> {
    try {
      const message = await TicketMessage.create({ ticketId, author, discordUserId, content });
      const ticket = await Ticket.findById(ticketId).exec();
      if (!ticket) return;
      if (author === 'support') {
        await this.notifyUser(ticket.discordUserId, `Support replied: ${content}`);
      }
      logger.info({ ticketId }, 'Added message to ticket');
    } catch (err) {
      logger.error({ err }, 'Failed to add ticket message');
    }
  }

  /**
   * Notify a user via DM if possible. Returns false if the DM fails (e.g.
   * because the user has DMs disabled).
   */
  async notifyUser(discordUserId: string, message: string): Promise<boolean> {
    try {
      const user = await client.users.fetch(discordUserId);
      if (!user) return false;
      await user.send(message);
      return true;
    } catch (err) {
      logger.warn({ err }, 'Failed to notify user via DM');
      return false;
    }
  }
}

export const ticketService = new TicketService();