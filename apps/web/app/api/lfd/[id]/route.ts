import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongoose';
import { LFDListingModel } from '../../../../models/lfdListing';
import { z } from 'zod';

const updateSchema = z.object({
  region: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional()
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const listing = await LFDListingModel.findById(params.id).populate('userId', 'username roles');
  if (!listing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ data: listing });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const listing = await LFDListingModel.findById(params.id);
  if (!listing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (listing.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  Object.assign(listing, parsed.data);
  await listing.save();
  return NextResponse.json({ data: listing });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const listing = await LFDListingModel.findById(params.id);
  if (!listing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (listing.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await LFDListingModel.deleteOne({ _id: params.id });
  return NextResponse.json({ success: true });
}