import mongoose, { Document, Schema } from 'mongoose';

export interface ITicketMessage extends Document {
  ticketId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TicketMessageModel = mongoose.models.TicketMessage || mongoose.model<ITicketMessage>('TicketMessage', TicketMessageSchema);
