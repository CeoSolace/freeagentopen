import mongoose from 'mongoose';

/**
 * AuditLog captures sensitive actions taken by the worker and bot, such as
 * banning/unbanning users, role changes, or support resolutions. Each log
 * entry records the actor (if available), the target, a description and
 * optional metadata. Use this for accountability and compliance.
 */
export interface IAuditLog {
  actorId?: string; // Discord ID of the actor, if any
  action: string;
  targetId?: string;
  data?: Record<string, any>;
  createdAt?: Date;
}

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: String },
    action: { type: String, required: true },
    targetId: { type: String },
    data: { type: (mongoose as any).Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);