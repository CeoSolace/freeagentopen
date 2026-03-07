import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectDB } from '../../../lib/mongoose';
import { UserModel } from '../../../models/user';
import { hasRole, ROLES } from '../../../lib/roles';
import Link from 'next/link';

/**
 * Admin page to list all users. Only admins can access. Each user row links
 * to a detail page where roles and ban status can be modified.
 */
export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    redirect('/');
  }
  await connectDB();
  const users = await UserModel.find().sort({ createdAt: -1 });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">All Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Username
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user: any) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-2 whitespace-nowrap">
                  <Link href={`/admin/users/${user._id.toString()}`} className="text-primary hover:underline">
                    {user.username}
                  </Link>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {user.roles.join(', ')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {user.banned ? 'Banned' : 'Active'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}