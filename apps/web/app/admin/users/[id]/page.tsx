import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "../../../../lib/mongoose";
import { UserModel } from "../../../../models/user";
import { hasRole, ROLES, type RoleKey } from "../../../../lib/roles";
import UserAdminForm from "../../../../components/UserAdminForm";

interface AdminUserDetailPageProps {
  params: { id: string };
}

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

export default async function AdminUserDetailPage({
  params
}: AdminUserDetailPageProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserWithRoles | undefined;
  const roles = (user?.roles || []) as RoleKey[];

  if (!user || !hasRole(roles, ROLES.ADMIN)) {
    redirect("/");
  }

  await connectDB();

  const targetUser = await UserModel.findById(params.id);

  if (!targetUser) {
    return notFound();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">
        User: {targetUser.username}
      </h2>
      <UserAdminForm user={JSON.parse(JSON.stringify(targetUser))} />
    </div>
  );
}
