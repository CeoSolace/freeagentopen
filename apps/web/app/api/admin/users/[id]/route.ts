import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectDB } from '../../../../../lib/mongoose';
import { UserModel } from '../../../../../models/user';
import { hasRole, ROLES, type RoleKey } from '../../../../../lib/roles';
import { z } from 'zod';

const updateSchema = z.object({
  roles: z.array(z.string()).optional(),
  banned: z.boolean().optional(),
  accountAllowed: z.boolean().optional()
});

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

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserWithRoles | undefined;
  const roles = (user?.roles || []) as RoleKey[];

  if (!user || !hasRole(roles, ROLES.ADMIN)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const targetUser = await UserModel.findById(params.id);

  if (!targetUser) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ data: targetUser });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserWithRoles | undefined;
  const roles = (user?.roles || []) as RoleKey[];

  if (!user || !hasRole(roles, ROLES.ADMIN)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const targetUser = await UserModel.findById(params.id);

  if (!targetUser) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (parsed.data.roles) targetUser.roles = parsed.data.roles as any;
  if (typeof parsed.data.banned === 'boolean') targetUser.banned = parsed.data.banned;
  if (typeof parsed.data.accountAllowed === 'boolean') {
    targetUser.accountAllowed = parsed.data.accountAllowed;
  }

  await targetUser.save();

  return NextResponse.json({ data: targetUser });
}
