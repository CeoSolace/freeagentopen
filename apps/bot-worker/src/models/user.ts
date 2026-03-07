import mongoose from 'mongoose';

/**
 * Minimal user model used by the bot/worker. In the full monorepo this model
 * will be provided by the shared package. Fields included here are only those
 * required for Discord integration and synchronisation logic.
 */
export interface IUser {
  discordId: string; // Snowflake of the Discord user
  roles: string[]; // Site role keys assigned to the user (e.g. OWNER, ADMIN)
  verified: boolean; // Whether the user has completed Discord verification on the website
  memberRoleAssigned: boolean; // Whether the MEMBER role has been granted in Discord
  autoJoinConsent: boolean; // Whether the user consented to auto join the guild via OAuth
  banned: boolean; // Whether the user is currently banned on the site
  banReason?: string;
  banExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true },
    roles: { type: [String], default: [] },
    verified: { type: Boolean, default: false },
    memberRoleAssigned: { type: Boolean, default: false },
    autoJoinConsent: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    banReason: { type: String },
    banExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model('User', userSchema);