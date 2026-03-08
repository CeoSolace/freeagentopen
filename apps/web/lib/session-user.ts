import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authOptions } from "../app/api/auth/[...nextauth]/route";

type SessionUser = {
  id: string;
  roles: string[];
  verified: boolean;
  banned: boolean;
  accountAllowed: boolean;
  openingFeeDue: boolean;
  paymentMethodAdded: boolean;
};

type SessionUserApiResult =
  | {
      ok: false;
      response: NextResponse;
    }
  | {
      ok: true;
      user: SessionUser;
    };

export async function requireSessionUser(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  return {
    id: String((session.user as any).id),
    roles: Array.isArray((session.user as any).roles) ? (session.user as any).roles : [],
    verified: Boolean((session.user as any).verified),
    banned: Boolean((session.user as any).banned),
    accountAllowed: (session.user as any).accountAllowed !== false,
    openingFeeDue: Boolean((session.user as any).openingFeeDue),
    paymentMethodAdded: Boolean((session.user as any).paymentMethodAdded),
  };
}

export async function requireSessionUserApi(): Promise<SessionUserApiResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ok: true,
    user: {
      id: String((session.user as any).id),
      roles: Array.isArray((session.user as any).roles) ? (session.user as any).roles : [],
      verified: Boolean((session.user as any).verified),
      banned: Boolean((session.user as any).banned),
      accountAllowed: (session.user as any).accountAllowed !== false,
      openingFeeDue: Boolean((session.user as any).openingFeeDue),
      paymentMethodAdded: Boolean((session.user as any).paymentMethodAdded),
    },
  };
}
