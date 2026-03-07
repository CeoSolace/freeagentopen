import mongoose, { Document, Schema } from 'mongoose';

export interface IUserBan extends Document {
  userId: mongoose.Types.ObjectId;
  reason: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

const UserBanSchema = new Schema<IUserBan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const UserBanModel = mongoose.models.UserBan || mongoose.model<IUserBan>('UserBan', UserBanSchema);
