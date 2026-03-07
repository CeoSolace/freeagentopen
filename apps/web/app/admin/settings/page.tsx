import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { hasRole, ROLES } from '../../../lib/roles';

/**
 * Admin settings page placeholder. Would expose platform configuration to
 * owners and admins.
 */
export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    redirect('/');
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Platform Settings</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Settings management will appear here.</p>
    </div>
  );
}