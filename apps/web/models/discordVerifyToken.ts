import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscordVerifyToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const DiscordVerifyTokenSchema = new Schema<IDiscordVerifyToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const DiscordVerifyTokenModel = mongoose.models.DiscordVerifyToken || mongoose.model<IDiscordVerifyToken>('DiscordVerifyToken', DiscordVerifyTokenSchema);
