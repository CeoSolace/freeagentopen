import mongoose from 'mongoose';

/**
 * RoleMapping stores the relationship between a site role key (e.g. ADMIN) and
 * a Discord role ID. This allows the role sync service to determine which
 * Discord roles to assign to a member based on their site roles. In the
 * monorepo this model will likely come from the shared package.
 */
export interface IRoleMapping {
  siteRole: string;
  discordRoleId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const roleMappingSchema = new mongoose.Schema(
  {
    siteRole: { type: String, required: true, unique: true },
    discordRoleId: { type: String, required: true },
  },
  { timestamps: true }
);

export const RoleMapping =
  mongoose.models.RoleMapping ||
  mongoose.model('RoleMapping', roleMappingSchema);