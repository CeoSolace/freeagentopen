import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongoose";
import { PostModel } from "../../../../models/post";
import { requireSessionUserApi } from "../../../../lib/session-user";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const post = await PostModel.findById(params.id);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: post });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSessionUserApi();
  if (!auth.ok) return auth.response;

  await connectDB();

  const post = await PostModel.findById(params.id);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.userId.toString() !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await PostModel.deleteOne({ _id: params.id });

  return NextResponse.json({ success: true });
}
