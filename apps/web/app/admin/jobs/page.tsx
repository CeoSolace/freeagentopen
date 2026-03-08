import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hasRole, ROLES, type RoleKey } from "../../../lib/roles";

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

/**
 * Admin jobs monitor page placeholder. Would display background job status and
 * allow control of scheduled tasks.
 */
export default async function AdminJobsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserWithRoles | undefined;
  const roles = (user?.roles || []) as RoleKey[];

  if (!user || !hasRole(roles, ROLES.ADMIN)) {
    redirect("/");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Jobs Monitor</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Job monitoring functionality is coming soon.
      </p>
    </div>
  );
}
