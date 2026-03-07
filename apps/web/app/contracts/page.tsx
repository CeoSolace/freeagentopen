import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectDB } from '../../lib/mongoose';
import { ContractModel } from '../../models/contract';
import CreateContractForm from '../../components/CreateContractForm';
import Link from 'next/link';

/**
 * Lists the contracts that the current user is a participant in. Provides
 * a form to create a new contract. Each contract is shown with its title
 * and current state and links to the detail page.
 */
export default async function ContractsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  await connectDB();
  const contracts = await ContractModel.find({ participantIds: session.user.id }).sort({ updatedAt: -1 });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Contracts</h2>
      <CreateContractForm />
      {contracts.length === 0 && <p className="text-gray-600 dark:text-gray-400">You are not part of any contracts.</p>}
      <ul className="space-y-2">
        {contracts.map(contract => (
          <li key={contract._id}>
            <Link
              href={`/contracts/${contract._id.toString()}`}
              className="block px-4 py-3 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            >
              <p className="font-medium">{contract.title}</p>
              <p className="text-xs text-gray-500">State: {contract.state}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}