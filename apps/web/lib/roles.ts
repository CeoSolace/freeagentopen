export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MOD: 'MOD',
  SUPPORT: 'SUPPORT',
  MEMBER: 'MEMBER'
} as const;

export type RoleKey = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy defines the precedence of roles. A user with a higher role
 * automatically inherits permissions from roles below them. The order of
 * entries in this array matters: earlier roles have higher privileges.
 */
export const ROLE_HIERARCHY: RoleKey[] = [
  ROLES.OWNER,
  ROLES.ADMIN,
  ROLES.MOD,
  ROLES.SUPPORT,
  ROLES.MEMBER
];

/**
 * Helper to determine whether a user has at least the given role. Since roles
 * cascade downward according to the hierarchy, an OWNER has all permissions
 * including ADMIN and MOD, whereas a MEMBER has only the baseline level. Pass
 * in the list of assigned roles on the user and the minimum required role.
 */
export function hasRole(userRoles: RoleKey[] | undefined, required: RoleKey): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  const requiredIndex = ROLE_HIERARCHY.indexOf(required);
  return userRoles.some(role => ROLE_HIERARCHY.indexOf(role) <= requiredIndex);
}
