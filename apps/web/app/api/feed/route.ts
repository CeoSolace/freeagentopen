import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "../../../lib/mongoose";
import { PostModel } from "../../../models/post";
import { requireSessionUserApi } from "../../../lib/session-user";

const createPostSchema = z.object({
  sector: z.string().min(1),
  content: z.string().min(1).max(5000),
  images: z.array(z.string()).optional().default([])
});

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const sector = searchParams.get("sector");

  const query = sector ? { sector } : {};
  const posts = await PostModel.find(query).sort({ createdAt: -1 }).limit(100);

  return NextResponse.json({ data: posts });
}

export async function POST(req: NextRequest) {
  const auth = await requireSessionUserApi();
  if (!auth.ok) {
    return auth.response;
  }

  const body = await req.json().catch(() => null);
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const { sector, content, images } = parsed.data;

  const post = await PostModel.create({
    userId: auth.user.id,
    sector,
    content,
    images
  });

  return NextResponse.json({ data: post }, { status: 201 });
}
