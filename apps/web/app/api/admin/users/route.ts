import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "../../../../lib/mongoose";
import { UserModel } from "../../../../models/user";
import { hasRole, ROLES, type RoleKey } from "../../../../lib/roles";

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

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  const user = session?.user as SessionUserWithRoles | undefined;
  const roles = (user?.roles || []) as RoleKey[];

  if (!user || !hasRole(roles, ROLES.ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const users = await UserModel.find().sort({ createdAt: -1 });

  return NextResponse.json({ data: users });
}
