import mongoose from 'mongoose';
import type { Types } from 'mongoose';

/**
 * Messages associated with a support ticket. Messages may originate from a
 * user (type 'user') or from a support agent or bot (type 'support'). The
 * worker service uses these to send DM updates and log interactions.
 */
export interface ITicketMessage {
  ticketId: Types.ObjectId;
  author: 'user' | 'support';
  discordUserId?: string; // present when author is user
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ticketMessageSchema = new mongoose.Schema(
  {
    ticketId: { type: (mongoose as any).Schema.Types.ObjectId, ref: 'Ticket', required: true },
    author: { type: String, enum: ['user', 'support'], required: true },
    discordUserId: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const TicketMessage =
  mongoose.models.TicketMessage ||
  mongoose.model('TicketMessage', ticketMessageSchema);