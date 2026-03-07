import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../lib/mongoose';
import { LFTProfileModel } from '../../../models/lftProfile';
import { meterUsage } from '../../../lib/meterUsage';
import { z } from 'zod';

// Validation schema for creating a new LFT profile.
const createSchema = z.object({
  sector: z.string(),
  region: z.string(),
  bio: z.string().optional()
});

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get('sector');
  const region = searchParams.get('region');
  const query: Record<string, any> = {};
  if (sector) query.sector = sector;
  if (region) query.region = region;
  const profiles = await LFTProfileModel.find(query).populate('userId', 'username roles');
  return NextResponse.json({ data: profiles });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parse = createSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const { sector, region, bio } = parse.data;
  const existing = await LFTProfileModel.findOne({ userId: session.user.id, sector });
  if (existing) {
    return NextResponse.json({ error: 'A profile already exists for this sector' }, { status: 400 });
  }
  const profile = await LFTProfileModel.create({
    userId: session.user.id,
    sector,
    region,
    bio
  });
  // Meter usage for profile creation
  await meterUsage(session.user.id, 'lft_profile_create', 1);
  return NextResponse.json({ data: profile });
}
