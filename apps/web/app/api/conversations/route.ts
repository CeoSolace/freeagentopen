import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../lib/mongoose';
import { ConversationModel } from '../../../models/conversation';
import { z } from 'zod';

const createSchema = z.object({
  participantId: z.string()
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const conversations = await ConversationModel.find({ participantIds: session.user.id }).sort({ updatedAt: -1 });
  return NextResponse.json({ data: conversations });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const otherUserId = parsed.data.participantId;
  await connectDB();
  // Check if conversation exists
  const existing = await ConversationModel.findOne({
    participantIds: { $all: [session.user.id, otherUserId], $size: 2 }
  });
  if (existing) {
    return NextResponse.json({ data: existing });
  }
  const convo = await ConversationModel.create({ participantIds: [session.user.id, otherUserId] });
  return NextResponse.json({ data: convo });
}