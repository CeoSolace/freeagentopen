import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import { connectDB } from '../../../lib/mongoose';
import { ContractModel } from '../../../models/contract';
import { ContractVersionModel } from '../../../models/contractVersion';
import ContractDetail from '../../../components/ContractDetail';

interface ContractDetailPageProps {
  params: { id: string };
}

/**
 * Displays a single contract. Validates that the current user is a participant
 * before showing details. Loads the contract and its version history and
 * renders the ContractDetail client component.
 */
export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  await connectDB();
  const contract = await ContractModel.findById(params.id);
  if (!contract || !contract.participantIds.includes(session.user.id as any)) {
    return notFound();
  }
  const versions = await ContractVersionModel.find({ contractId: params.id }).sort({ versionNumber: -1 });
  return (
    <ContractDetail
      contract={JSON.parse(JSON.stringify(contract))}
      versions={JSON.parse(JSON.stringify(versions))}
    />
  );
}