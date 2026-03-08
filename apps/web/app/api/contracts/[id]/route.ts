import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "../../../../lib/mongoose";
import { ContractModel } from "../../../../models/contract";
import { ContractVersionModel } from "../../../../models/contractVersion";
import { requireSessionUserApi } from "../../../../lib/session-user";

const updateContractSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  state: z.enum(["draft", "proposed", "accepted", "archived"]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSessionUserApi();
  if (!auth.ok) return auth.response;

  const userId = auth.user.id;

  await connectDB();
  const contract = await ContractModel.findById(params.id);

  if (!contract || !contract.participantIds.includes(userId as any)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const versions = await ContractVersionModel.find({ contractId: params.id }).sort({
    versionNumber: -1,
  });

  return NextResponse.json({ data: { contract, versions } });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSessionUserApi();
  if (!auth.ok) return auth.response;

  const userId = auth.user.id;
  const body = await req.json().catch(() => null);
  const parsed = updateContractSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  const contract = await ContractModel.findById(params.id);

  if (!contract || !contract.participantIds.includes(userId as any)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (typeof parsed.data.title === "string") {
    contract.title = parsed.data.title;
  }

  if (typeof parsed.data.state === "string") {
    contract.state = parsed.data.state;
  }

  await contract.save();

  if (typeof parsed.data.content === "string") {
    const latestVersion = await ContractVersionModel.findOne({
      contractId: contract._id,
    }).sort({ versionNumber: -1 });

    const nextVersionNumber = latestVersion
      ? Number(latestVersion.versionNumber || 0) + 1
      : 1;

    await ContractVersionModel.create({
      contractId: contract._id,
      versionNumber: nextVersionNumber,
      content: parsed.data.content,
      createdBy: userId,
    });
  }

  const versions = await ContractVersionModel.find({
    contractId: contract._id,
  }).sort({ versionNumber: -1 });

  return NextResponse.json({ data: { contract, versions } });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSessionUserApi();
  if (!auth.ok) return auth.response;

  const userId = auth.user.id;

  await connectDB();
  const contract = await ContractModel.findById(params.id);

  if (!contract || !contract.participantIds.includes(userId as any)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await ContractVersionModel.deleteMany({ contractId: contract._id });
  await ContractModel.findByIdAndDelete(contract._id);

  return NextResponse.json({ success: true });
}
