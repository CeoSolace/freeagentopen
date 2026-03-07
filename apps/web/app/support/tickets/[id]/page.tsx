import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import { connectDB } from '../../../../lib/mongoose';
import { TicketModel } from '../../../../models/ticket';
import { TicketMessageModel } from '../../../../models/ticketMessage';
import TicketThread from '../../../../components/TicketThread';

interface TicketDetailPageProps {
  params: { id: string };
}

/**
 * Shows a single support ticket and its message timeline. Only the owner of
 * the ticket may view and reply. Messages are passed to a client component
 * to handle real‑time updates.
 */
export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  await connectDB();
  const ticket = await TicketModel.findById(params.id);
  if (!ticket || ticket.userId.toString() !== session.user.id) {
    return notFound();
  }
  const messages = await TicketMessageModel.find({ ticketId: params.id }).sort({ createdAt: 1 });
  return (
    <div className="space-y-4 h-full">
      <h2 className="text-2xl font-semibold mb-4">Ticket: {ticket.subject}</h2>
      <div className="h-[70vh]">
        <TicketThread ticketId={ticket._id.toString()} initialMessages={JSON.parse(JSON.stringify(messages))} />
      </div>
    </div>
  );
}
