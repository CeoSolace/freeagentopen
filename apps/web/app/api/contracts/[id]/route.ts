import { notFound } from "next/navigation";
import { connectDB } from "../../../lib/mongoose";
import { ContractModel } from "../../../models/contract";
import { ContractVersionModel } from "../../../models/contractVersion";
import ContractDetail from "../../../components/ContractDetail";
import { requireSessionUser } from "../../../lib/session-user";

interface ContractDetailPageProps {
  params: { id: string };
}

export default async function ContractDetailPage({
  params,
}: ContractDetailPageProps) {
  const user = await requireSessionUser();

  await connectDB();

  const contract = await ContractModel.findById(params.id).lean();

  if (!contract || !(contract.participantIds as any[]).includes(user.id as any)) {
    notFound();
  }

  const versions = await ContractVersionModel.find({
    contractId: params.id,
  })
    .sort({ versionNumber: -1 })
    .lean();

  return <ContractDetail contract={contract} versions={versions} />;
}
