import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "../../../lib/mongoose";
import { CommentModel } from "../../../models/comment";

const createCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(2000)
});

type SessionUserWithId = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUserWithId | undefined;

  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const comment = await CommentModel.create({
    userId: sessionUser.id,
    postId: parsed.data.postId,
    content: parsed.data.content
  });

  return NextResponse.json({ data: comment }, { status: 201 });
}
