import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { hasRole, ROLES } from '../../../lib/roles';

type SessionUserWithRoles = {
  id?: string;
  roles?: string[];
  verified?: boolean;
  banned?: boolean;
  openingFeeDue?: boolean;
  paymentMethodAdded?: boolean;
  accountAllowed?: boolean;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default async function AdminAdminsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserWithRoles | undefined;

  if (!user || !hasRole((user.roles || []) as any, ROLES.OWNER)) {
    redirect('/');
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Admins Management</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Admin management tools will appear here.
      </p>
    </div>
  );
}
