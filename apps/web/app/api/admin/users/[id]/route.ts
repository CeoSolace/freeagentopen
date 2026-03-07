import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../../lib/mongoose';
import { UserModel } from '../../../../../models/user';
import { hasRole, ROLES } from '../../../../../lib/roles';
import { z } from 'zod';

const updateSchema = z.object({
  roles: z.array(z.string()).optional(),
  banned: z.boolean().optional(),
  accountAllowed: z.boolean().optional()
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const user = await UserModel.findById(params.id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: user });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const user = await UserModel.findById(params.id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (parsed.data.roles) user.roles = parsed.data.roles as any;
  if (typeof parsed.data.banned === 'boolean') user.banned = parsed.data.banned;
  if (typeof parsed.data.accountAllowed === 'boolean') user.accountAllowed = parsed.data.accountAllowed;
  await user.save();
  return NextResponse.json({ data: user });
}