import mongoose, { Document, Schema } from 'mongoose';

export interface IRoleMapping extends Document {
  userId: mongoose.Types.ObjectId;
  roleName: string;
  createdAt: Date;
}

const RoleMappingSchema = new Schema<IRoleMapping>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roleName: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RoleMappingSchema.index({ userId: 1, roleName: 1 }, { unique: true });

export const RoleMappingModel = mongoose.models.RoleMapping || mongoose.model<IRoleMapping>('RoleMapping', RoleMappingSchema);
