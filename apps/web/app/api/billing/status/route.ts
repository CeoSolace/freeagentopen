import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongoose';
import { UserModel } from '../../../../models/user';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const user = await UserModel.findById(session.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({
    data: {
      paymentMethodAdded: user.paymentMethodAdded,
      openingFeeDue: user.openingFeeDue,
      openingFeeDeadline: user.openingFeeDeadline
    }
  });
}