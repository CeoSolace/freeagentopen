import { notFound } from 'next/navigation';
import { connectDB } from '../../../lib/mongoose';
import { UserModel } from '../../../models/user';
import { LFTProfileModel } from '../../../models/lftProfile';
import { LFDListingModel } from '../../../models/lfdListing';
import { PostModel } from '../../../models/post';
import Card from '../../../components/Card';

interface ProfilePageProps {
  params: { idOrUsername: string };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { idOrUsername } = params;
  await connectDB();
  let user = await UserModel.findOne({ _id: idOrUsername });
  if (!user) {
    user = await UserModel.findOne({ username: idOrUsername });
  }
  if (!user) {
    notFound();
  }
  const lftProfiles = await LFTProfileModel.find({ userId: user._id });
  const lfdListings = await LFDListingModel.find({ userId: user._id });
  const posts = await PostModel.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20);
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-2">{user.username}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Discord ID: {user.discordId}</p>
        {user.region && <p className="text-sm">Region: {user.region}</p>}
        <p className="text-sm mt-2">Roles: {user.roles.join(', ')}</p>
      </Card>
      <div>
        <h3 className="text-lg font-semibold mb-2">Looking For Team Profiles</h3>
        {lftProfiles.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No LFT profiles.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {lftProfiles.map(profile => (
              <Card key={profile._id}>
                <p className="font-semibold capitalize">{profile.sector}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Region: {profile.region}</p>
                {profile.bio && <p className="mt-1 text-sm">{profile.bio}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Looking For Player Listings</h3>
        {lfdListings.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No LFD listings.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {lfdListings.map(listing => (
              <Card key={listing._id}>
                <p className="font-semibold capitalize">{listing.sector}</p>
                <p className="text-sm">{listing.title}</p>
                {listing.description && <p className="mt-1 text-sm">{listing.description}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Recent Posts</h3>
        {posts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No posts.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Card key={post._id}>
                <p className="mb-1 text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                <p>{post.content}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
