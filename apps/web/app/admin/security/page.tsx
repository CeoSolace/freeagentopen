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
 * Admin security page placeholder. In a full implementation this would
 * surface tools to monitor and manage security events, IP bans, audit logs
 * and other sensitive information.
 */
export default async function AdminSecurityPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserWithRoles | undefined;
  const roles = (user?.roles || []) as RoleKey[];

  if (!user || !hasRole(roles, ROLES.ADMIN)) {
    redirect("/");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Security Dashboard</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Security monitoring and controls will appear here.
      </p>
    </div>
  );
}
