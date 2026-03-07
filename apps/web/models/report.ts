import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: string;
  targetId: mongoose.Types.ObjectId;
  reason: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: 'open' }
  },
  { timestamps: true }
);

export const ReportModel = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
