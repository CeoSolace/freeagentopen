import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AddPaymentMethod from '../../../components/AddPaymentMethod';

/**
 * Resolve page shown when a payment or setup action is required. It simply
 * renders the payment method form. If the user is not logged in they are
 * redirected.
 */
export default async function BillingResolvePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Resolve Billing</h2>
      <AddPaymentMethod />
    </div>
  );
}