import mongoose, { Document, Schema } from 'mongoose';

export interface IUsageAggregate extends Document {
  userId: mongoose.Types.ObjectId;
  period: string;
  totals: Record<string, number>;
  createdAt: Date;
}

const UsageAggregateSchema = new Schema<IUsageAggregate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    period: { type: String, required: true },
    totals: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UsageAggregateSchema.index({ userId: 1, period: 1 }, { unique: true });

export const UsageAggregateModel = mongoose.models.UsageAggregate || mongoose.model<IUsageAggregate>('UsageAggregate', UsageAggregateSchema);
