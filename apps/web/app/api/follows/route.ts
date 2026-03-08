import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "../../../lib/mongoose";
import { FollowModel } from "../../../models/follow";

const toggleFollowSchema = z.object({
  targetId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const followerId = String((session.user as any).id);

  const body = await req.json().catch(() => null);
  const parsed = toggleFollowSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { targetId } = parsed.data;

  if (followerId === targetId) {
    return NextResponse.json(
      { error: "You cannot follow yourself" },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await FollowModel.findOne({
    followerId,
    followingId: targetId,
  });

  if (existing) {
    await FollowModel.deleteOne({ _id: existing._id });
    return NextResponse.json({ data: { following: false } });
  }

  await FollowModel.create({
    followerId,
    followingId: targetId,
  });

  return NextResponse.json({ data: { following: true } });
}
