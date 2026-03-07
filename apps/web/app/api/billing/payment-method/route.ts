import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongoose';
import { UserModel } from '../../../../models/user';
import { z } from 'zod';

const schema = z.object({ paymentMethodId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const user = await UserModel.findById(session.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  user.paymentMethodAdded = true;
  user.openingFeeDue = false;
  await user.save();
  return NextResponse.json({ success: true });
}