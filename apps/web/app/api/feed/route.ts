import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../lib/mongoose';
import { PostModel } from '../../../models/post';
import { meterUsage } from '../../../lib/meterUsage';
import { z } from 'zod';

const postSchema = z.object({
  sector: z.string().optional(),
  content: z.string(),
  images: z.array(z.string()).optional()
});

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get('sector');
  const query: any = {};
  if (sector) query.sector = sector;
  const posts = await PostModel.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('userId', 'username roles');
  return NextResponse.json({ data: posts });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const { sector, content, images } = parsed.data;
  const post = await PostModel.create({
    userId: session.user.id,
    sector,
    content,
    images
  });
  await meterUsage(session.user.id, 'post_create', 1);
  return NextResponse.json({ data: post });
}