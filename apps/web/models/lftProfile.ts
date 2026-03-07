import mongoose, { Document, Schema } from 'mongoose';

export interface ILFTProfile extends Document {
  userId: mongoose.Types.ObjectId;
  sector: string;
  region: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LFTProfileSchema = new Schema<ILFTProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sector: { type: String, required: true },
    region: { type: String, required: true },
    bio: { type: String }
  },
  { timestamps: true }
);

export const LFTProfileModel = mongoose.models.LFTProfile || mongoose.model<ILFTProfile>('LFTProfile', LFTProfileSchema);
