import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../lib/mongoose';
import { CommentModel } from '../../../models/comment';
import { meterUsage } from '../../../lib/meterUsage';
import { z } from 'zod';

const commentSchema = z.object({
  postId: z.string(),
  content: z.string()
});

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('postId');
  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  }
  const comments = await CommentModel.find({ postId }).populate('userId', 'username roles');
  return NextResponse.json({ data: comments });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const comment = await CommentModel.create({
    userId: session.user.id,
    postId: parsed.data.postId,
    content: parsed.data.content
  });
  await meterUsage(session.user.id, 'comment_create', 1);
  return NextResponse.json({ data: comment });
}