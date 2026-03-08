import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "../../../lib/mongoose";
import { ConversationModel } from "../../../models/conversation";
import { requireSessionUserApi } from "../../../lib/session-user";

const createConversationSchema = z.object({
  participantId: z.string().min(1)
});

export async function GET(_req: NextRequest) {
  const auth = await requireSessionUserApi();
  if (!auth.ok) return auth.response;

  await connectDB();

  const conversations = await ConversationModel.find({
    participantIds: auth.user.id
  }).sort({ updatedAt: -1 });

  return NextResponse.json({ data: conversations });
}

export async function POST(req: NextRequest) {
  const auth = await requireSessionUserApi();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createConversationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const participantIds = Array.from(
    new Set([auth.user.id, parsed.data.participantId])
  );

  let conversation = await ConversationModel.findOne({
    participantIds: { $all: participantIds, $size: participantIds.length }
  });

  if (!conversation) {
    conversation = await ConversationModel.create({
      participantIds
    });
  }

  return NextResponse.json({ data: conversation }, { status: 201 });
}
