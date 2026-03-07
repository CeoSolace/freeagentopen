import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongoose';
import { UserModel } from '../../../../models/user';
import { validateVerifyToken, assignMemberRole } from '../../../../lib/discord';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  try {
    // Call the bot worker to validate the token and ensure the Discord user is part of the guild.
    await validateVerifyToken(token);
    await assignMemberRole(session.user.id);
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }
  await connectDB();
  const user = await UserModel.findById(session.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  user.verified = true;
  await user.save();
  return NextResponse.json({ success: true });
}