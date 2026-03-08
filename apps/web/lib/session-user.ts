import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authOptions } from "../app/api/auth/[...nextauth]/route";
import type { RoleKey } from "./roles";

export type AppSessionUser = {
  id: string;
  roles: RoleKey[];
  verified?: boolean;
  banned?: boolean;
  openingFeeDue?: boolean;
  paymentMethodAdded?: boolean;
  accountAllowed?: boolean;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function requireSessionUser(): Promise<AppSessionUser> {
  const session = await getServerSession(authOptions);
  const user = session?.user as Partial<AppSessionUser> | undefined;

  if (!user?.id) {
    redirect("/");
  }

  return {
    id: user.id,
    roles: (user.roles || []) as RoleKey[],
    verified: !!user.verified,
    banned: !!user.banned,
    openingFeeDue: !!user.openingFeeDue,
    paymentMethodAdded: !!user.paymentMethodAdded,
    accountAllowed: user.accountAllowed !== false,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null
  };
}

export async function requireSessionUserApi() {
  const session = await getServerSession(authOptions);
  const user = session?.user as Partial<AppSessionUser> | undefined;

  if (!user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  return {
    ok: true as const,
    user: {
      id: user.id,
      roles: (user.roles || []) as RoleKey[],
      verified: !!user.verified,
      banned: !!user.banned,
      openingFeeDue: !!user.openingFeeDue,
      paymentMethodAdded: !!user.paymentMethodAdded,
      accountAllowed: user.accountAllowed !== false,
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null
    }
  };
}
