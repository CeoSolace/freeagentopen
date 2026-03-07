import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../lib/mongoose';
import { FollowModel } from '../../../models/follow';
import { z } from 'zod';

const followSchema = z.object({
  targetId: z.string()
});

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type'); // 'followers' or 'following'
  if (!userId || !type) {
    return NextResponse.json({ error: 'userId and type are required' }, { status: 400 });
  }
  let query;
  if (type === 'followers') {
    query = { followingId: userId };
  } else if (type === 'following') {
    query = { followerId: userId };
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  const follows = await FollowModel.find(query).populate(type === 'followers' ? 'followerId' : 'followingId', 'username roles');
  return NextResponse.json({ data: follows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = followSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const targetId = parsed.data.targetId;
  await connectDB();
  // Toggle follow
  const existing = await FollowModel.findOne({ followerId: session.user.id, followingId: targetId });
  if (existing) {
    await FollowModel.deleteOne({ _id: existing._id });
    return NextResponse.json({ data: { following: false } });
  }
  const follow = await FollowModel.create({ followerId: session.user.id, followingId: targetId });
  return NextResponse.json({ data: { following: true } });
}