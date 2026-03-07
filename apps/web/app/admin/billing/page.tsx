import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hasRole, ROLES } from "../../../lib/roles";

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
 * Admin billing overview page. Placeholder for billing analytics and
 * administrative billing controls.
 */
export default async function AdminBillingPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserWithRoles | undefined;

  if (!user || !hasRole(user.roles || [], ROLES.ADMIN)) {
    redirect("/");
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold">Admin Billing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Billing metrics and administrative controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-white dark:bg-gray-900">
          <h3 className="font-medium">Total Revenue</h3>
          <p className="text-2xl font-bold mt-2">£0.00</p>
        </div>

        <div className="p-4 rounded-lg border bg-white dark:bg-gray-900">
          <h3 className="font-medium">Opening Fees</h3>
          <p className="text-2xl font-bold mt-2">£0.00</p>
        </div>

        <div className="p-4 rounded-lg border bg-white dark:bg-gray-900">
          <h3 className="font-medium">Usage Charges</h3>
          <p className="text-2xl font-bold mt-2">£0.00</p>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">Billing Activity</h2>
        <p className="text-sm text-gray-500">
          Billing activity and controls will appear here.
        </p>
      </div>
    </div>
  );
}
