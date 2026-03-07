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

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  await connectDB();

  const userToConnect =
    typeof searchParams.user === 'string' ? searchParams.user : undefined;

  if (userToConnect) {
    let convo = await ConversationModel.findOne({
      participantIds: { $all: [session.user.id, userToConnect], $size: 2 }
    });

    if (!convo) {
      convo = await ConversationModel.create({
        participantIds: [session.user.id, userToConnect]
      });
    }

    redirect(`/messages/${convo._id.toString()}`);
  }

  const conversations = await ConversationModel.find({
    participantIds: session.user.id
  }).sort({ updatedAt: -1 });

  const otherIds: string[] = [];

  conversations.forEach((c: any) => {
    const other = c.participantIds.find(
      (id: any) => id.toString() !== session.user.id
    );

    if (other) {
      otherIds.push(other.toString());
    }
  });

  const users = await UserModel.find({ _id: { $in: otherIds } });

  const userMap: Record<string, any> = {};

  users.forEach((u: any) => {
    userMap[u._id.toString()] = u;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Conversations</h2>

      {conversations.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">
          You have no conversations yet.
        </p>
      )}

      <ul className="space-y-2">
        {conversations.map((convo: any) => {
          const other = convo.participantIds.find(
            (id: any) => id.toString() !== session.user.id
          );
          const otherUser = other ? userMap[other.toString()] : null;

          return (
            <li key={convo._id.toString()}>
              <Link
                href={`/messages/${convo._id.toString()}`}
                className="block px-4 py-3 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              >
                <p className="font-medium">
                  {otherUser?.username || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(convo.updatedAt).toLocaleString()}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
