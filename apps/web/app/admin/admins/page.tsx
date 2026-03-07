import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { hasRole, ROLES } from '../../../lib/roles';

/**
 * Admins management page placeholder. Only owners can access this page
 * to promote or demote administrators.
 */
export default async function AdminAdminsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.OWNER)) {
    redirect('/');
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Admins Management</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Admin management tools will appear here.</p>
    </div>
  );
}