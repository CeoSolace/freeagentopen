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

export default async function AdminBillingPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserWithRoles | undefined;
  const roles = (user?.roles || []) as RoleKey[];

  if (!user || !hasRole(roles, ROLES.ADMIN)) {
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <h3 className="font-medium">Total Revenue</h3>
          <p className="mt-2 text-2xl font-bold">£0.00</p>
        </div>

        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <h3 className="font-medium">Opening Fees</h3>
          <p className="mt-2 text-2xl font-bold">£0.00</p>
        </div>

        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <h3 className="font-medium">Usage Charges</h3>
          <p className="mt-2 text-2xl font-bold">£0.00</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
        <h2 className="mb-2 text-lg font-semibold">Billing Activity</h2>
        <p className="text-sm text-gray-500">
          Billing activity and controls will appear here.
        </p>
      </div>
    </div>
  );
}
