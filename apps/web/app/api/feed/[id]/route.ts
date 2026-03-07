import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongoose';
import { PostModel } from '../../../../models/post';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const post = await PostModel.findById(params.id).populate('userId', 'username roles');
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ data: post });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const post = await PostModel.findById(params.id);
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (post.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await PostModel.deleteOne({ _id: params.id });
  return NextResponse.json({ success: true });
}
