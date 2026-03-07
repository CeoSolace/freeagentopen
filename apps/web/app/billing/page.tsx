import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectDB } from '../../lib/mongoose';
import { UserModel } from '../../models/user';
import AddPaymentMethod from '../../components/AddPaymentMethod';
import Button from '../../components/Button';

/**
 * Billing dashboard. Displays the user's billing status including whether
 * they have added a payment method and whether an opening fee is due. If
 * necessary it renders the Stripe payment flow to collect a payment method.
 */
export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  await connectDB();
  const user = await UserModel.findById(session.user.id);
  if (!user) {
    redirect('/');
  }
  // For SSR we convert to JSON to avoid serialisation issues
  const u = JSON.parse(JSON.stringify(user));
  const payMethod = u.paymentMethodAdded;
  const openingFeeDue = u.openingFeeDue;
  const openingFeeDeadline = u.openingFeeDeadline ? new Date(u.openingFeeDeadline).toLocaleString() : null;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Billing</h2>
      {!payMethod && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-semibold mb-2">Add Payment Method</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            To unlock full access you must add a payment method. Overages and paid features will be billed to this method.
          </p>
          <AddPaymentMethod />
        </div>
      )}
      {payMethod && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">A payment method is on file.</p>
        </div>
      )}
      {openingFeeDue && (
        <div className="p-4 border border-red-200 dark:border-red-700 rounded-md bg-red-50 dark:bg-red-900">
          <h3 className="text-lg font-semibold mb-2 text-red-700 dark:text-red-300">Opening Fee Due</h3>
          <p className="text-sm mb-2">Your opening fee has not been paid. You must pay this one‑time fee to continue using the platform.</p>
          {openingFeeDeadline && (
            <p className="text-sm mb-2">Deadline: {openingFeeDeadline}</p>
          )}
          <form
            action="/api/billing/opening-fee"
            method="POST"
            className="inline-block"
          >
            <Button type="submit" variant="danger">
              Pay Opening Fee Now
            </Button>
          </form>
        </div>
      )}
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold mb-2">Usage</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Usage analytics and detailed billing statements will appear here.</p>
      </div>
    </div>
  );
}