import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongoose';
import { UserModel } from '../../../../models/user';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const user = await UserModel.findById(session.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  // In production you would create a PaymentIntent with Stripe here and confirm it.
  // For now we simply mark the opening fee as paid.
  user.openingFeeDue = false;
  await user.save();
  return NextResponse.json({ success: true });
}