import mongoose from 'mongoose';

/**
 * DiscordVerifyToken stores one-time tokens used during the Discord → website
 * verification flow. Only the hashed token is stored so that raw tokens are
 * never persisted. Tokens expire after a short period (e.g. 15 minutes).
 */
export interface IDiscordVerifyToken {
  discordUserId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt?: Date;
}

const discordVerifyTokenSchema = new mongoose.Schema(
  {
    discordUserId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const DiscordVerifyToken =
  mongoose.models.DiscordVerifyToken ||
  mongoose.model('DiscordVerifyToken', discordVerifyTokenSchema);