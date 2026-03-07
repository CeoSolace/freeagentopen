import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectDB } from '../../../lib/mongoose';
import { LFTProfileModel } from '../../../models/lftProfile';
import ManageLFT from '../../../components/ManageLFT';

export default async function LFTManagePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  await connectDB();
  const profiles = await LFTProfileModel.find({ userId: session.user.id });
  return <ManageLFT initialProfiles={JSON.parse(JSON.stringify(profiles))} />;
}
