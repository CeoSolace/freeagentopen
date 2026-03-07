import { z } from 'zod';
import {
  SECTORS,
  REGIONS,
  ROLE_KEYS,
  ACCOUNT_STATES,
  VERIFICATION_STATES,
  BAN_REASON_CODES,
  USAGE_FEATURE_KEYS,
  PERMISSION_KEYS
} from './constants';

/**
 * Zod schemas for validating canonical values.  Use these schemas to
 * validate incoming API parameters or environment variables.  They ensure
 * that only known strings are accepted.
 */

export const sectorSchema = z.enum(SECTORS);
export const regionSchema = z.enum(REGIONS);
export const roleKeySchema = z.enum(ROLE_KEYS);
export const accountStateSchema = z.enum(ACCOUNT_STATES);
export const verificationStateSchema = z.enum(VERIFICATION_STATES);
export const banReasonCodeSchema = z.enum(BAN_REASON_CODES);
export const usageFeatureKeySchema = z.enum(USAGE_FEATURE_KEYS);
export const permissionKeySchema = z.enum(PERMISSION_KEYS);

/**
 * Example composite schema for validating a role mapping request.  This can
 * be imported by both the web and bot/worker services to ensure that a
 * new role mapping object conforms to the expected shape.
 */
export const roleMappingSchema = z.object({
  siteRole: roleKeySchema,
  discordRoleId: z.string().min(1)
});

/**
 * Example composite schema for validating a usage event.  Other services can
 * extend or refine this schema based on additional requirements.
 */
export const usageEventSchema = z.object({
  userId: z.string().min(1),
  feature: usageFeatureKeySchema,
  amount: z.number().nonnegative(),
  createdAt: z.date()
});