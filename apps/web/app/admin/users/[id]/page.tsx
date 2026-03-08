import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "../../../../lib/mongoose";
import { UserModel } from "../../../../models/user";
import { hasRole, ROLES, type RoleKey } from "../../../../lib/roles";

interface AdminUserDetailPageProps {
  params: {
    id: string;
  };
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          User: {targetUser.username}
        </h1>
        <p className="text-sm text-gray-500">
          Discord ID: {targetUser.discordId}
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p>
          <strong>User ID:</strong> {targetUser._id.toString()}
        </p>

        <p>
          <strong>Roles:</strong>{" "}
          {Array.isArray(targetUser.roles)
            ? targetUser.roles.join(", ")
            : "None"}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {targetUser.banned ? "Banned" : "Active"}
        </p>

        <p>
          <strong>Verified:</strong>{" "}
          {targetUser.verified ? "Yes" : "No"}
        </p>

        <p>
          <strong>Account Allowed:</strong>{" "}
          {targetUser.accountAllowed ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
}
