import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectDB } from '../../../lib/mongoose';
import { TicketModel } from '../../../models/ticket';
import Link from 'next/link';

/**
 * Lists the support tickets opened by the current user. Each ticket links
 * to its detail page where the user can view the message history and reply.
 */
export default async function TicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  await connectDB();
  const tickets = await TicketModel.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">My Support Tickets</h2>
      {tickets.length === 0 && <p className="text-gray-600 dark:text-gray-400">You have no support tickets.</p>}
      <ul className="space-y-2">
        {tickets.map(ticket => (
          <li key={ticket._id}>
            <Link
              href={`/support/tickets/${ticket._id.toString()}`}
              className="block px-4 py-3 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            >
              <p className="font-medium">{ticket.subject}</p>
              <p className="text-xs text-gray-500">Opened: {ticket.createdAt.toLocaleString()}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}