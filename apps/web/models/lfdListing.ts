import mongoose, { Document, Schema } from 'mongoose';

export interface ILFDListing extends Document {
  userId: mongoose.Types.ObjectId;
  sector: string;
  region: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LFDListingSchema = new Schema<ILFDListing>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sector: { type: String, required: true },
    region: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String }
  },
  { timestamps: true }
);

export const LFDListingModel = mongoose.models.LFDListing || mongoose.model<ILFDListing>('LFDListing', LFDListingSchema);
