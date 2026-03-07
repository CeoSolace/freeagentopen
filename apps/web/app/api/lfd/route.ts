import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../lib/mongoose';
import { LFDListingModel } from '../../../models/lfdListing';
import { meterUsage } from '../../../lib/meterUsage';
import { z } from 'zod';

const createSchema = z.object({
  sector: z.string(),
  region: z.string(),
  title: z.string(),
  description: z.string().optional()
});

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const query: Record<string, any> = {};
  const sector = searchParams.get('sector');
  const region = searchParams.get('region');
  if (sector) query.sector = sector;
  if (region) query.region = region;
  const listings = await LFDListingModel.find(query).populate('userId', 'username roles');
  return NextResponse.json({ data: listings });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const listing = await LFDListingModel.create({
    userId: session.user.id,
    ...parsed.data
  });
  await meterUsage(session.user.id, 'lfd_listing_create', 1);
  return NextResponse.json({ data: listing });
}