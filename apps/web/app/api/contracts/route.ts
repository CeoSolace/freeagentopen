import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../lib/mongoose';
import { ContractModel } from '../../../models/contract';
import { ContractVersionModel } from '../../../models/contractVersion';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string(),
  participantIds: z.array(z.string()),
  content: z.string()
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const contracts = await ContractModel.find({ participantIds: session.user.id });
  return NextResponse.json({ data: contracts });
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
  const { title, participantIds, content } = parsed.data;
  if (!participantIds.includes(session.user.id)) {
    participantIds.push(session.user.id);
  }
  const contract = await ContractModel.create({ title, participantIds, state: 'draft' });
  await ContractVersionModel.create({ contractId: contract._id, versionNumber: 1, content, signedBy: [] });
  return NextResponse.json({ data: contract });
}