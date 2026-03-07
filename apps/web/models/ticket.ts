import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    status: { type: String, default: 'open' }
  },
  { timestamps: true }
);

export const TicketModel = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
