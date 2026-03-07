import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: { type: [String], default: [] }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const RoleModel = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
