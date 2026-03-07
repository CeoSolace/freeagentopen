import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { hasRole, ROLES } from '../../../../lib/roles';

/**
 * Admin Discord users page placeholder. Would allow admins to view and sync
 * Discord users with platform users.
 */
export default async function AdminDiscordUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    redirect('/');
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Discord Users</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Discord user management functionality will be added here.</p>
    </div>
  );
}