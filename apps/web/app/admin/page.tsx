import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROLES, hasRole } from '../../lib/roles';

/**
 * Admin dashboard overview. Provides navigation to all administrative
 * sections. Only users with ADMIN or higher roles can access this page.
 */
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    redirect('/');
  }
  const links = [
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/roles', label: 'Roles' },
    { href: '/admin/billing', label: 'Billing' },
    { href: '/admin/security', label: 'Security' },
    { href: '/admin/bans', label: 'Bans' },
    { href: '/admin/discord/roles', label: 'Discord Roles' },
    { href: '/admin/discord/users', label: 'Discord Users' },
    { href: '/admin/jobs', label: 'Jobs' },
    { href: '/admin/settings', label: 'Settings' },
    { href: '/admin/audit', label: 'Audit Logs' },
    { href: '/admin/owners', label: 'Owners' },
    { href: '/admin/admins', label: 'Admins' }
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-4 py-6 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <p className="font-medium text-lg">{link.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}