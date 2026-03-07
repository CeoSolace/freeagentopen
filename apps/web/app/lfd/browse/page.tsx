import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import Card from '../../../components/Card';
import SectorFilter from '../../../components/SectorFilter';
import RegionFilter from '../../../components/RegionFilter';
import Link from 'next/link';
import { connectDB } from '../../../lib/mongoose';
import { LFDListingModel } from '../../../models/lfdListing';
import { UserModel } from '../../../models/user';

interface BrowsePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * LFD browse page. Allows visitors to filter team/org listings by sector and region.
 * For logged‑in users a manage link is shown. Listings include title, region,
 * description and a connect action to start a conversation with the owner.
 */
export default async function LFDBrowsePage({ searchParams }: BrowsePageProps) {
  const session = await getServerSession(authOptions);
  const sector = typeof searchParams.sector === 'string' ? searchParams.sector : undefined;
  const region = typeof searchParams.region === 'string' ? searchParams.region : undefined;
  await connectDB();
  const filter: any = {};
  if (sector) filter.sector = sector;
  if (region) filter.region = region;
  const listings = await LFDListingModel.find(filter).sort({ createdAt: -1 }).limit(100);
  // Preload the owners to show usernames
  const ownerIds = listings.map(l => l.userId);
  const users = await UserModel.find({ _id: { $in: ownerIds } });
  const userMap: Record<string, any> = {};
  users.forEach(u => {
    userMap[u._id.toString()] = u;
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-2xl font-semibold">Looking For Players/Org</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <SectorFilter />
          <RegionFilter />
        </div>
      </div>
      {session && (
        <Link href="/lfd/manage" className="inline-block mb-4 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">
          Manage My LFD Listings
        </Link>
      )}
      {(!listings || listings.length === 0) && <p className="text-gray-600 dark:text-gray-400">No listings found.</p>}
      {listings && listings.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(listing => {
            const owner = userMap[listing.userId.toString()];
            return (
              <Card key={listing._id}>
                <div className="flex justify-between items-center mb-2">
                  <Link href={`/profile/${owner?._id || ''}`} className="font-semibold hover:underline">
                    {owner?.username || 'User'}
                  </Link>
                  <span className="text-xs text-gray-500">{listing.region}</span>
                </div>
                <p className="capitalize text-sm mb-1">Sector: {listing.sector}</p>
                <p className="text-sm font-medium mb-1">{listing.title}</p>
                {listing.description && <p className="text-sm mb-1">{listing.description}</p>}
                <Link href={`/messages?user=${owner?._id || ''}`} className="mt-2 inline-block text-primary hover:underline text-sm">
                  Connect
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}