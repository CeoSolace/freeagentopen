import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongoose';
import { UserModel } from '../../../../models/user';
import { hasRole, ROLES } from '../../../../lib/roles';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasRole(session.user.roles as any, ROLES.ADMIN)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const users = await UserModel.find().limit(100);
  return NextResponse.json({ data: users });
}