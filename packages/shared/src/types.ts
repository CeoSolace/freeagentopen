import type {
  RoleKey,
  Sector,
  Region,
  AccountState,
  VerificationState,
  BanReasonCode,
  UsageFeatureKey,
  PermissionKey
} from './constants';

/**
 * Represents a mapping between a site role key and a Discord role ID.
 *
 * The platform treats site roles as canonical and maps them to Discord
 * identifiers for synchronisation.  Only the roles defined in RoleKey
 * should be used as the `siteRole` value.
 */
export interface RoleMapping {
  siteRole: RoleKey;
  discordRoleId: string;
}

/**
 * Represents the current access state for a user account.  The website
 * computes this state on each request to determine whether the user should
 * have access to the platform, be prompted to verify their Discord account
 * or pay an opening fee, or be redirected due to a ban.
 */
export interface UserAccessState {
  accountAllowed: boolean;
  banned: boolean;
  banReason?: BanReasonCode;
  verificationState: VerificationState;
  accountState: AccountState;
}

/**
 * Represents a usage event emitted by either the website or the bot/worker.
 * These events can be aggregated for billing or monitoring purposes.
 */
export interface UsageEvent {
  userId: string;
  feature: UsageFeatureKey;
  amount: number;
  createdAt: Date;
}

/**
 * Represents an aggregate of usage events over a time period.  This structure
 * could be stored in MongoDB or emitted to a metrics store.
 */
export interface UsageAggregate {
  userId: string;
  feature: UsageFeatureKey;
  total: number;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Represents a single audit log entry.  Audit logs track sensitive actions
 * performed by users or system processes.  The `action` field should be one
 * of the values defined in the `AUDIT_ACTIONS` constant.
 */
export interface AuditLogEntry {
  actorId: string;
  action: string;
  targetId?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Represents a support ticket message.  Used in the support/ticket system.
 */
export interface TicketMessage {
  authorId: string;
  content: string;
  createdAt: Date;
}

/**
 * Represents a support ticket.  Tickets can be created by users or the bot
 * and are used to track issues through resolution.
 */
export interface Ticket {
  id: string;
  userId: string;
  category: string;
  status: string;
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Defines a generic map of permission keys to booleans.  This can be used
 * to model fine‑grained permission sets on roles.
 */
export type PermissionSet = Partial<Record<PermissionKey, boolean>>;