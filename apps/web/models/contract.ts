import mongoose, { Document, Schema } from 'mongoose';

export type ContractState = 'draft' | 'proposed' | 'accepted' | 'archived';

export interface IContract extends Document {
  participantIds: mongoose.Types.ObjectId[];
  state: ContractState;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    participantIds: { type: [Schema.Types.ObjectId], ref: 'User', required: true },
    state: { type: String, enum: ['draft', 'proposed', 'accepted', 'archived'], default: 'draft' },
    title: { type: String, required: true }
  },
  { timestamps: true }
);

export const ContractModel = mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);
