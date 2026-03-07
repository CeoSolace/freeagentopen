/**
 * Canonical enumerations and constants used throughout the FreeAgentsLTD
 * platform.  These constants define game sectors, geographic regions, role
 * keys, account states, verification states, ban reasons, usage/billing
 * features and permission keys.  Referencing these constants rather than
 * hard‑coding strings helps prevent typos and makes refactoring safer.
 */

// Supported game sectors for the LFT/LFD connectors and feed filtering.
export const SECTORS = [
  'fortnite',
  'valorant',
  'cod',
  'r6',
  'rocket_league',
  'lol'
] as const;
export type Sector = typeof SECTORS[number];

// Canonical geographic regions used for filtering and regionalisation.
export const REGIONS = [
  'NA',  // North America
  'EU',  // Europe
  'UKIE', // United Kingdom & Ireland
  'OCE', // Oceania
  'BR',  // Brazil
  'LATAM', // Latin America
  'MENA', // Middle East & North Africa
  'APAC', // Asia‑Pacific
  'SEA',  // South East Asia
  'IN',  // India
  'AF'   // Africa
] as const;
export type Region = typeof REGIONS[number];

// Immutable site role keys.  These correspond to high‑level platform roles.
export const ROLE_KEYS = [
  'OWNER',
  'ADMIN',
  'MOD',
  'SUPPORT',
  'MEMBER'
] as const;
export type RoleKey = typeof ROLE_KEYS[number];

// Account states describe the billing/verification status of a user.
export const ACCOUNT_STATES = [
  'full',            // normal account with full access
  'child',           // read‑only account with limited features
  'opening_fee_due', // account awaiting payment of the opening fee
  'closed',          // account closed and cleared
  'admin'            // elevated account used by administrators
] as const;
export type AccountState = typeof ACCOUNT_STATES[number];

// Verification states used by the Discord verification flow.
export const VERIFICATION_STATES = [
  'unverified',  // user has not started the verification process
  'pending',     // user has clicked the verify button but not completed
  'verified'     // user has verified their account and joined the guild
] as const;
export type VerificationState = typeof VERIFICATION_STATES[number];

// Reason codes used when banning a user from the platform.
export const BAN_REASON_CODES = [
  'cheating',
  'abuse',
  'spam',
  'fraud',
  'other'
] as const;
export type BanReasonCode = typeof BAN_REASON_CODES[number];

// Feature keys used for usage/billing events.  Each key represents a
// billable or trackable feature of the platform.
export const USAGE_FEATURE_KEYS = [
  'messages',
  'posts',
  'comments',
  'contracts',
  'support',
  'billing',
  'discord'
] as const;
export type UsageFeatureKey = typeof USAGE_FEATURE_KEYS[number];

// Permission keys used by the admin dashboard.  These keys map to actions
// that administrators or moderators can perform.  They can be combined in
// various role definitions.
export const PERMISSION_KEYS = [
  'VIEW_USERS',
  'MANAGE_USERS',
  'VIEW_BILLING',
  'MANAGE_BILLING',
  'VIEW_AUDIT',
  'MANAGE_ROLES',
  'VIEW_SUPPORT',
  'MANAGE_SUPPORT',
  'VIEW_SECURITY',
  'MANAGE_SECURITY',
  'VIEW_SETTINGS',
  'MANAGE_SETTINGS'
] as const;
export type PermissionKey = typeof PERMISSION_KEYS[number];

// Audit action keys used to describe entries in the audit log.
export const AUDIT_ACTIONS = [
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DELETE',
  'ROLE_ASSIGN',
  'ROLE_REMOVE',
  'BAN_CREATE',
  'BAN_REMOVE',
  'CONTRACT_CREATE',
  'CONTRACT_UPDATE',
  'CONTRACT_ACCEPT',
  'PAYMENT_ATTEMPT',
  'TICKET_CREATE',
  'TICKET_UPDATE'
] as const;
export type AuditAction = typeof AUDIT_ACTIONS[number];