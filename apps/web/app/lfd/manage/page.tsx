import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectDB } from '../../../lib/mongoose';
import { LFDListingModel } from '../../../models/lfdListing';
import ManageLFD from '../../../components/ManageLFD';

/**
 * Page for managing the current user's LFD listings. If the user is not
 * authenticated they are redirected home. It loads the user's existing
 * listings from MongoDB and passes them to the ManageLFD client component.
 */
export default async function LFDManagePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  await connectDB();
  const listings = await LFDListingModel.find({ userId: session.user.id });
  return <ManageLFD initialListings={JSON.parse(JSON.stringify(listings))} />;
}