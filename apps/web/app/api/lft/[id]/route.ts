import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongoose';
import { LFTProfileModel } from '../../../../models/lftProfile';
import { z } from 'zod';

// Schema for updates
const updateSchema = z.object({
  region: z.string().optional(),
  bio: z.string().optional()
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const profile = await LFTProfileModel.findById(params.id).populate('userId', 'username roles');
  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ data: profile });
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
  const profile = await LFTProfileModel.findById(params.id);
  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  // Only the owner may update their profile.
  if (profile.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  Object.assign(profile, parsed.data);
  await profile.save();
  return NextResponse.json({ data: profile });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const profile = await LFTProfileModel.findById(params.id);
  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (profile.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await LFTProfileModel.deleteOne({ _id: params.id });
  return NextResponse.json({ success: true });
}