import { ROLE_KEYS, RoleKey } from './constants';

/**
 * A simple hierarchy ordering for roles.  Higher numbers represent more
 * powerful roles.  The ordering is OWNER > ADMIN > MOD > SUPPORT > MEMBER.
 */
const ROLE_HIERARCHY: Record<RoleKey, number> = {
  OWNER: 4,
  ADMIN: 3,
  MOD: 2,
  SUPPORT: 1,
  MEMBER: 0
};

/**
 * Returns `true` if the user has at least the required role.  This helper
 * treats roles as hierarchical; for example, a user with the ADMIN role is
 * considered to also have MOD, SUPPORT and MEMBER privileges.  If the
 * `roles` array is empty, the user has no privileges and the function
 * returns `false` for any required role other than MEMBER.
 *
 * @param roles - The list of role keys assigned to the user
 * @param required - The minimum role required to perform an action
 */
export function hasRole(roles: RoleKey[], required: RoleKey): boolean {
  if (roles.length === 0) return required === 'MEMBER';
  const maxLevel = Math.max(...roles.map(r => ROLE_HIERARCHY[r] ?? -1));
  return maxLevel >= ROLE_HIERARCHY[required];
}

/**
 * Returns `true` if role `a` is strictly higher than role `b` in the
 * hierarchy.  Useful for enforcing that only higher roles can manage lower
 * roles.
 */
export function isHigherRole(a: RoleKey, b: RoleKey): boolean {
  return ROLE_HIERARCHY[a] > ROLE_HIERARCHY[b];
}

/**
 * Exhaustiveness check helper for switch statements.  If invoked, this
 * function will throw an error indicating that an unexpected value was
 * encountered.  Use it when dealing with discriminated unions.
 */
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}