import mongoose, { Document, Schema } from 'mongoose';

export interface IUsageEvent extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  amount: number;
  timestamp: Date;
}

const UsageEventSchema = new Schema<IUsageEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, required: true }
  },
  { timestamps: false }
);

export const UsageEventModel = mongoose.models.UsageEvent || mongoose.model<IUsageEvent>('UsageEvent', UsageEventSchema);
