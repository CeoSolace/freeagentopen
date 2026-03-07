import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to FreeAgentsLTD</h1>
      <p className="text-lg mb-6">
        The premier platform to connect esports players and teams across multiple sectors. Build your profile, find
        teammates, post to the community feed and manage your contracts all in one place.
      </p>
      <div className="flex justify-center space-x-4">
        {session ? (
          <>
            <Link href="/feed" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">
              Go to Feed
            </Link>
            <Link href="/lft/manage" className="px-4 py-2 rounded-md bg-secondary text-white hover:bg-secondary-dark">
              Manage LFT Profile
            </Link>
          </>
        ) : (
          <Link href="/feed" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">
            Browse Feed
          </Link>
        )}
      </div>
    </div>
  );
}
