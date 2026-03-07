import { redirect } from 'next/navigation';

/**
 * After completing an off‑site payment or setup flow the user is redirected
 * to this page. Immediately redirect back to the billing dashboard.
 */
export default function BillingReturnPage() {
  redirect('/billing');
  return null;
}