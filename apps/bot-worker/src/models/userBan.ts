import mongoose from 'mongoose';

/**
 * UserBan documents record bans issued either by the site or Discord. These
 * records are used by the ban sync service to keep bans in sync between
 * systems. When a ban is no longer active the document may be archived.
 */
export interface IUserBan {
  discordUserId: string;
  reason: string;
  expiresAt?: Date;
  active: boolean;
  source: 'site' | 'discord';
  createdAt?: Date;
  updatedAt?: Date;
}

const userBanSchema = new mongoose.Schema(
  {
    discordUserId: { type: String, required: true, index: true },
    reason: { type: String, default: 'Violation of rules' },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
    source: { type: String, enum: ['site', 'discord'], required: true },
  },
  { timestamps: true }
);

export const UserBan =
  mongoose.models.UserBan || mongoose.model('UserBan', userBanSchema);