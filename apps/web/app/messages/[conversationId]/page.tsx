import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "../../../lib/mongoose";
import { ConversationModel } from "../../../models/conversation";
import { UserModel } from "../../../models/user";
import MessageThread from "../../../components/MessageThread";

interface ConversationPageProps {
  params: {
    conversationId: string;
  };
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const { conversationId } = params;

  await connectDB();

  const convo = await ConversationModel.findById(conversationId);

  if (!convo || !convo.participantIds.includes(session.user.id as any)) {
    return notFound();
  }

  const otherId = convo.participantIds.find(
    (id: any) => id.toString() !== session.user.id
  );

  const otherUser = otherId ? await UserModel.findById(otherId) : null;

  return (
    <div className="space-y-4 h-full">
      <h2 className="text-2xl font-semibold">
        Conversation with {otherUser?.username || "User"}
      </h2>

      <div className="h-[70vh]">
        <MessageThread conversationId={conversationId} />
      </div>
    </div>
  );
}
