import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { hasRole, ROLES } from '../../../lib/roles';

/**
 * Admin bans page placeholder. Would list banned users and IP addresses
 * along with controls to ban or unban entities.
 */
export default async function AdminBansPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    redirect('/');
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Bans</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Ban management functionality is coming soon.</p>
    </div>
  );
}