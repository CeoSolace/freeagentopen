import mongoose from 'mongoose';

/**
 * IP bans are tracked at the website level and mirrored here for reference.
 * The worker service generally does not act on IP bans directly but may use
 * them when enforcing actions such as DM suppression. This model is provided
 * for completeness.
 */
export interface IIpBan {
  ipHash: string;
  reason: string;
  expiresAt?: Date;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ipBanSchema = new mongoose.Schema(
  {
    ipHash: { type: String, required: true, unique: true },
    reason: { type: String, default: 'Violation of rules' },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const IpBan =
  mongoose.models.IpBan || mongoose.model('IpBan', ipBanSchema);