import { ROLES } from './roles';

export interface AccessState {
  allowed: boolean;
  reason: string | null;
  banned?: boolean;
  requiresVerification?: boolean;
  openingFeeDue?: boolean;
  childAccount?: boolean;
}

/**
 * Compute whether a user can access the site. This helper centralises all
 * business logic around gating. The returned `AccessState` can be inspected
 * by the middleware and route handlers to determine the correct user
 * experience (e.g. redirect to billing, show banned page, etc.).
 */
export function getAccessState(user: {
  id: string;
  roles: string[];
  accountAllowed?: boolean;
  banned?: boolean;
  ipBanned?: boolean;
  verified?: boolean;
  openingFeeDue?: boolean;
  openingFeeDeadline?: Date | null;
  paymentMethodAdded?: boolean;
}): AccessState {
  // If the account is explicitly disallowed, deny access.
  if (user.accountAllowed === false) {
    return { allowed: false, reason: 'account_disallowed' };
  }
  // If the user is banned, show banned screen.
  if (user.banned || user.ipBanned) {
    return { allowed: false, reason: 'banned', banned: true };
  }
  // If the user is not verified, require Discord verification.
  if (!user.verified) {
    return { allowed: false, reason: 'verification_required', requiresVerification: true };
  }
  // Opening fee due? Block until paid, except for billing pages.
  if (user.openingFeeDue) {
    return { allowed: false, reason: 'opening_fee_due', openingFeeDue: true };
  }
  // After 14 days without a payment method the account becomes read‑only.
  if (!user.paymentMethodAdded) {
    return { allowed: true, reason: null, childAccount: true };
  }
  // All checks passed.
  return { allowed: true, reason: null };
}
