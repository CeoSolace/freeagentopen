import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CreateTicketForm from '../../components/CreateTicketForm';

/**
 * Entry point for support. Displays a simple knowledge base search bar and
 * allows users to open a new support ticket. Links to view existing tickets.
 */
export default async function SupportPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Support</h2>
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
        <input
          type="text"
          placeholder="Search help articles..."
          className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
        />
        <p className="text-sm text-gray-500 mt-2">Search results will appear here in a future update.</p>
      </div>
      <CreateTicketForm />
      <Link
        href="/support/tickets"
        className="inline-block px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark"
      >
        View My Tickets
      </Link>
    </div>
  );
}