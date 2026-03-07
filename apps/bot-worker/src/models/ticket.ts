import mongoose from 'mongoose';
import type { Types } from 'mongoose';

/**
 * Support tickets created by users via the website or Discord. The worker
 * interacts with these to send DM updates and allow closing via slash
 * commands. A ticket can be open, pending or closed.
 */
export interface ITicket {
  userId: Types.ObjectId; // reference to the site user
  discordUserId: string;
  status: 'open' | 'pending' | 'closed';
  subject: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ticketSchema = new mongoose.Schema(
  {
    userId: { type: (mongoose as any).Schema.Types.ObjectId, ref: 'User', required: true },
    discordUserId: { type: String, required: true },
    status: { type: String, enum: ['open', 'pending', 'closed'], default: 'open' },
    subject: { type: String, required: true },
  },
  { timestamps: true }
);

export const Ticket =
  mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);