import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  paymentMethodId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentAttemptSchema = new Schema<IPaymentAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentMethodId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'GBP' },
    status: { type: String, default: 'pending' }
  },
  { timestamps: true }
);

export const PaymentAttemptModel = mongoose.models.PaymentAttempt || mongoose.model<IPaymentAttempt>('PaymentAttempt', PaymentAttemptSchema);
