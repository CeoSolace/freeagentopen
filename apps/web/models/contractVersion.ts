import mongoose, { Document, Schema } from 'mongoose';

export interface IContractVersion extends Document {
  contractId: mongoose.Types.ObjectId;
  versionNumber: number;
  content: string;
  signedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ContractVersionSchema = new Schema<IContractVersion>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
    versionNumber: { type: Number, required: true },
    content: { type: String, required: true },
    signedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ContractVersionSchema.index({ contractId: 1, versionNumber: 1 }, { unique: true });

export const ContractVersionModel = mongoose.models.ContractVersion || mongoose.model<IContractVersion>('ContractVersion', ContractVersionSchema);
