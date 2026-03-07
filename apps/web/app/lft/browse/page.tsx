import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import Card from '../../../components/Card';
import SectorFilter from '../../../components/SectorFilter';
import RegionFilter from '../../../components/RegionFilter';
import Link from 'next/link';

interface BrowsePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function LFTBrowsePage({ searchParams }: BrowsePageProps) {
  const session = await getServerSession(authOptions);
  const sector = typeof searchParams.sector === 'string' ? searchParams.sector : undefined;
  const region = typeof searchParams.region === 'string' ? searchParams.region : undefined;
  const baseUrl = process.env.NEXTAUTH_URL || process.env.FRONTEND_URL || '';
  const query = new URLSearchParams();
  if (sector) query.set('sector', sector);
  if (region) query.set('region', region);
  const res = await fetch(`${baseUrl}/api/lft${query.toString() ? `?${query.toString()}` : ''}`, { cache: 'no-store' });
  const { data: profiles } = await res.json();
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-2xl font-semibold">Looking For Team</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <SectorFilter />
          <RegionFilter />
        </div>
      </div>
      {session && (
        <Link href="/lft/manage" className="inline-block mb-4 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">
          Manage My LFT Profiles
        </Link>
      )}
      {(!profiles || profiles.length === 0) && <p className="text-gray-600 dark:text-gray-400">No profiles found.</p>}
      {profiles && profiles.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile: any) => (
            <Card key={profile._id}>
              <div className="flex justify-between items-center mb-2">
                <Link href={`/profile/${profile.userId._id}`} className="font-semibold hover:underline">
                  {profile.userId.username}
                </Link>
                <span className="text-xs text-gray-500">{profile.region}</span>
              </div>
              <p className="capitalize text-sm mb-1">Sector: {profile.sector}</p>
              {profile.bio && <p className="text-sm">{profile.bio}</p>}
              <Link href={`/messages?user=${profile.userId._id}`} className="mt-2 inline-block text-primary hover:underline text-sm">
                Connect
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}