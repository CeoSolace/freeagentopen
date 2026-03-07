import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../lib/mongoose';
import { MessageModel } from '../../../models/message';
import { ConversationModel } from '../../../models/conversation';
import { meterUsage } from '../../../lib/meterUsage';
import { z } from 'zod';

const messageSchema = z.object({
  conversationId: z.string(),
  content: z.string(),
  imageUrl: z.string().optional()
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');
  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
  }
  await connectDB();
  // Check membership
  const convo = await ConversationModel.findById(conversationId);
  if (!convo || !convo.participantIds.includes(session.user.id as any)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const messages = await MessageModel.find({ conversationId }).sort({ createdAt: -1 }).limit(50);
  return NextResponse.json({ data: messages });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { conversationId, content, imageUrl } = parsed.data;
  await connectDB();
  const convo = await ConversationModel.findById(conversationId);
  if (!convo || !convo.participantIds.includes(session.user.id as any)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const message = await MessageModel.create({
    conversationId,
    senderId: session.user.id,
    content,
    imageUrl
  });
  // Update conversation updatedAt to sort
  convo.updatedAt = new Date();
  await convo.save();
  await meterUsage(session.user.id, 'message_send', 1);
  return NextResponse.json({ data: message });
}