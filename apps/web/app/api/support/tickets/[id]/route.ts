import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectDB } from '../../../../../lib/mongoose';
import { TicketModel } from '../../../../../models/ticket';
import { TicketMessageModel } from '../../../../../models/ticketMessage';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string()
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const ticket = await TicketModel.findById(params.id);
  if (!ticket || ticket.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const messages = await TicketMessageModel.find({ ticketId: params.id }).sort({ createdAt: 1 });
  return NextResponse.json({ data: { ticket, messages } });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const ticket = await TicketModel.findById(params.id);
  if (!ticket || ticket.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const msg = await TicketMessageModel.create({ ticketId: params.id, senderId: session.user.id, content: parsed.data.content });
  return NextResponse.json({ data: msg });
}
