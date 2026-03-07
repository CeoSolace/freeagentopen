import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { hasRole, ROLES } from '../../../lib/roles';

/**
 * Admin owners management page placeholder. Only owners can view this page.
 */
export default async function AdminOwnersPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.OWNER)) {
    redirect('/');
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Owners Management</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Owner management tools will be added here.</p>
    </div>
  );
}