import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectDB } from "../../../lib/mongoose";
import { UserModel } from "../../../models/user";
import { hasRole, ROLES, type RoleKey } from "../../../lib/roles";
import Link from "next/link";

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

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserWithRoles | undefined;
  const roles = (user?.roles || []) as RoleKey[];

  if (!user || !hasRole(roles, ROLES.ADMIN)) {
    redirect("/");
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
            {users.map((listedUser: any) => (
              <tr
                key={listedUser._id.toString()}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  <Link
                    href={`/admin/users/${listedUser._id.toString()}`}
                    className="text-primary hover:underline"
                  >
                    {listedUser.username}
                  </Link>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {Array.isArray(listedUser.roles)
                    ? listedUser.roles.join(", ")
                    : ""}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {listedUser.banned ? "Banned" : "Active"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
