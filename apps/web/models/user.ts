import mongoose, { Document, Schema } from 'mongoose';
import { RoleKey, ROLES } from '../lib/roles';

export interface IUser extends Document {
  discordId: string;
  username: string;
  discriminator?: string;
  avatar?: string;
  email?: string;
  roles: RoleKey[];
  region?: string;
  verified: boolean;
  accountAllowed?: boolean;
  banned?: boolean;
  ipBanned?: boolean;
  openingFeeDue?: boolean;
  openingFeeDeadline?: Date;
  paymentMethodAdded?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    discriminator: { type: String },
    avatar: { type: String },
    email: { type: String },
    roles: { type: [String], enum: Object.values(ROLES), default: ['MEMBER'] },
    region: { type: String },
    verified: { type: Boolean, default: false },
    accountAllowed: { type: Boolean, default: true },
    banned: { type: Boolean, default: false },
    ipBanned: { type: Boolean, default: false },
    openingFeeDue: { type: Boolean, default: false },
    openingFeeDeadline: { type: Date },
    paymentMethodAdded: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
