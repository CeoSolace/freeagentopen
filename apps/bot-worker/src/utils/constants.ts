/**
 * Immutable role keys used throughout the FreeAgentsLTD platform. The
 * hierarchy is defined by the order in the array: indexes lower in the
 * hierarchy imply greater privileges. These keys map to site permissions
 * and Discord roles through the RoleMapping model.
 */
export const ROLE_KEYS = ['OWNER', 'ADMIN', 'MOD', 'SUPPORT', 'MEMBER'] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];