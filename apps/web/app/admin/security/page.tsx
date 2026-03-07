import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { hasRole, ROLES } from '../../../lib/roles';

/**
 * Admin security page placeholder. In a full implementation this would
 * surface tools to monitor and manage security events, IP bans, audit logs
 * and other sensitive information.
 */
export default async function AdminSecurityPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    redirect('/');
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Security Dashboard</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Security monitoring and controls will appear here.</p>
    </div>
  );
}