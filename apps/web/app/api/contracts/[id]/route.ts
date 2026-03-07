import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongoose';
import { ContractModel } from '../../../../models/contract';
import { ContractVersionModel } from '../../../../models/contractVersion';
import { z } from 'zod';

const updateSchema = z.object({
  content: z.string().optional(),
  action: z.enum(['propose', 'accept', 'archive']).optional()
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const contract = await ContractModel.findById(params.id);
  if (!contract || !contract.participantIds.includes(session.user.id as any)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const versions = await ContractVersionModel.find({ contractId: params.id }).sort({ versionNumber: -1 });
  return NextResponse.json({ data: { contract, versions } });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const contract = await ContractModel.findById(params.id);
  if (!contract || !contract.participantIds.includes(session.user.id as any)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  // If updating content create new version
  if (parsed.data.content) {
    const latest = await ContractVersionModel.findOne({ contractId: params.id }).sort({ versionNumber: -1 });
    const nextVersion = latest ? latest.versionNumber + 1 : 1;
    await ContractVersionModel.create({ contractId: params.id, versionNumber: nextVersion, content: parsed.data.content, signedBy: [] });
    contract.state = 'draft';
  }
  // If performing state transition
  if (parsed.data.action) {
    switch (parsed.data.action) {
      case 'propose':
        contract.state = 'proposed';
        break;
      case 'accept':
        contract.state = 'accepted';
        break;
      case 'archive':
        contract.state = 'archived';
        break;
      default:
        break;
    }
  }
  await contract.save();
  return NextResponse.json({ data: contract });
}