import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { hasRole, ROLES } from '../../../lib/roles';

/**
 * Admin billing overview page. Placeholder for billing analytics and
 * administrative billing controls.
 */
export default async function AdminBillingPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    redirect('/');
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Admin Billing</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Billing metrics and controls will be added here.</p>
    </div>
  );
}