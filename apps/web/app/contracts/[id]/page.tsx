import { notFound, redirect } from "next/navigation";
import { connectDB } from "../../../lib/mongoose";
import { ContractModel } from "../../../models/contract";
import { ContractVersionModel } from "../../../models/contractVersion";
import ContractDetail from "../../../components/ContractDetail";
import { requireSessionUser } from "../../../lib/session-user";

interface ContractDetailPageProps {
  params: { id: string };
}

export default async function ContractDetailPage({
  params
}: ContractDetailPageProps) {
  const user = await requireSessionUser();

  if (!user?.id) {
    redirect("/");
  }

  await connectDB();

  const contract = await ContractModel.findById(params.id);

  if (!contract || !contract.participantIds.includes(user.id as any)) {
    return notFound();
  }

  const versions = await ContractVersionModel.find({
    contractId: params.id
  }).sort({ versionNumber: -1 });

  return (
    <ContractDetail
      contract={JSON.parse(JSON.stringify(contract))}
      versions={JSON.parse(JSON.stringify(versions))}
    />
  );
}
