import mongoose, { Document, Schema } from 'mongoose';

export interface IIPBan extends Document {
  ipHash: string;
  reason: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

const IPBanSchema = new Schema<IIPBan>(
  {
    ipHash: { type: String, required: true, unique: true },
    reason: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const IPBanModel = mongoose.models.IPBan || mongoose.model<IIPBan>('IPBan', IPBanSchema);
