import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongoose';
import { TicketModel } from '../../../../models/ticket';
import { TicketMessageModel } from '../../../../models/ticketMessage';
import { z } from 'zod';

const createSchema = z.object({
  subject: z.string(),
  message: z.string()
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const tickets = await TicketModel.find({ userId: session.user.id });
  return NextResponse.json({ data: tickets });
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
  await connectDB();
  const ticket = await TicketModel.create({ userId: session.user.id, subject: parsed.data.subject });
  await TicketMessageModel.create({ ticketId: ticket._id, senderId: session.user.id, content: parsed.data.message });
  return NextResponse.json({ data: ticket });
}