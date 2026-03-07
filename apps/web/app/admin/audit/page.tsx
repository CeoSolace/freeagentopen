import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { hasRole, ROLES } from '../../../lib/roles';

/**
 * Admin audit logs page placeholder. Would display logs of actions taken
 * across the platform for transparency and compliance.
 */
export default async function AdminAuditPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    redirect('/');
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Audit Logs</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Audit log viewer will be implemented here.</p>
    </div>
  );
}