import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participantIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participantIds: { type: [Schema.Types.ObjectId], ref: 'User', required: true }
  },
  { timestamps: true }
);

ConversationSchema.index({ participantIds: 1 });

export const ConversationModel = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
