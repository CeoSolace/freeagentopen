import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "../../../lib/mongoose";
import { ContractModel } from "../../../models/contract";
import { ContractVersionModel } from "../../../models/contractVersion";
import { requireSessionUserApi } from "../../../lib/session-user";

const createContractSchema = z.object({
  title: z.string().min(1),
  participantIds: z.array(z.string().min(1)).min(1),
  content: z.string().min(1)
});

export async function GET(_req: NextRequest) {
  const auth = await requireSessionUserApi();
  if (!auth.ok) return auth.response;

  await connectDB();

  const contracts = await ContractModel.find({
    participantIds: auth.user.id
  }).sort({ updatedAt: -1 });

  return NextResponse.json({ data: contracts });
}

export async function POST(req: NextRequest) {
  const auth = await requireSessionUserApi();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createContractSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const participantIds = Array.from(
    new Set([auth.user.id, ...parsed.data.participantIds])
  );

  const contract = await ContractModel.create({
    title: parsed.data.title,
    participantIds,
    state: "draft"
  });

  await ContractVersionModel.create({
    contractId: contract._id,
    versionNumber: 1,
    content: parsed.data.content,
    createdBy: auth.user.id
  });

  const createdContract = await ContractModel.findById(contract._id);

  return NextResponse.json({ data: createdContract }, { status: 201 });
}
