import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import { connectDB } from '../../../../lib/mongoose';
import { UserModel } from '../../../../models/user';
import { hasRole, ROLES } from '../../../../lib/roles';
import UserAdminForm from '../../../../components/UserAdminForm';

interface AdminUserDetailPageProps {
  params: { id: string };
}

/**
 * Admin user detail page. Loads a single user and renders a form to edit
 * their roles, ban status and account allowance. Only admins can access.
 */
export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    redirect('/');
  }
  await connectDB();
  const user = await UserModel.findById(params.id);
  if (!user) {
    return notFound();
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">User: {user.username}</h2>
      <UserAdminForm user={JSON.parse(JSON.stringify(user))} />
    </div>
  );
}
