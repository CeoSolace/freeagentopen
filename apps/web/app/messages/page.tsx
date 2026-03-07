import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectDB } from '../../lib/mongoose';
import { ConversationModel } from '../../models/conversation';
import { UserModel } from '../../models/user';
import Link from 'next/link';

interface MessagesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Messages landing page. If a `user` query param is provided the server
 * creates or retrieves an existing conversation with that user and
 * immediately redirects to the conversation thread. Otherwise it lists
 * existing conversations for the current user.
 */
export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  await connectDB();
  // If the user param is present create a conversation and redirect
  const userToConnect = typeof searchParams.user === 'string' ? searchParams.user : undefined;
  if (userToConnect) {
    // Check for existing conversation between the two users
    let convo = await ConversationModel.findOne({
      participantIds: { $all: [session.user.id, userToConnect], $size: 2 }
    });
    if (!convo) {
      convo = await ConversationModel.create({ participantIds: [session.user.id, userToConnect] });
    }
    redirect(`/messages/${convo._id.toString()}`);
  }
  // Otherwise list conversations for the current user
  const conversations = await ConversationModel.find({ participantIds: session.user.id }).sort({ updatedAt: -1 });
  // Preload names of other participants
  const otherIds: string[] = [];
  conversations.forEach(c => {
    const other = c.participantIds.find(id => id.toString() !== session.user.id);
    if (other) otherIds.push(other.toString());
  });
  const users = await UserModel.find({ _id: { $in: otherIds } });
  const userMap: Record<string, any> = {};
  users.forEach(u => {
    userMap[u._id.toString()] = u;
  });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Conversations</h2>
      {conversations.length === 0 && <p className="text-gray-600 dark:text-gray-400">You have no conversations yet.</p>}
      <ul className="space-y-2">
        {conversations.map(convo => {
          const other = convo.participantIds.find(id => id.toString() !== session.user.id);
          const otherUser = other ? userMap[other.toString()] : null;
          return (
            <li key={convo._id}>
              <Link
                href={`/messages/${convo._id.toString()}`}
                className="block px-4 py-3 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              >
                <p className="font-medium">{otherUser?.username || 'Unknown User'}</p>
                <p className="text-xs text-gray-500">Last updated: {convo.updatedAt.toLocaleString()}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}