import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import ConversationModel from "../../../models/Conversation";
import UserModel from "../../../models/User";

interface PageProps {
  params: {
    conversationId: string;
  };
}

export default async function ConversationPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/verify");
  }

  if (!mongoose.Types.ObjectId.isValid(params.conversationId)) {
    redirect("/messages");
  }

  const convo = await ConversationModel.findById(params.conversationId);

  if (!convo) {
    redirect("/messages");
  }

  const otherId = convo.participantIds.find(
    (id: mongoose.Types.ObjectId) => id.toString() !== session.user.id
  );

  const otherUser = otherId ? await UserModel.findById(otherId) : null;

  return (
    <div className="space-y-4 h-full">
      <div className="border-b pb-4">
        <h1 className="text-xl font-semibold">
          Conversation with {otherUser?.username ?? "Unknown User"}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Messages will render here */}
      </div>

      <div className="border-t pt-4">
        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
