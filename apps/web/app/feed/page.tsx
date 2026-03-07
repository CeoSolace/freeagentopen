import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Card from '../../components/Card';
import CreatePostForm from '../../components/CreatePostForm';
import SectorFilter from '../../components/SectorFilter';

interface FeedPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await getServerSession(authOptions);
  const sector = typeof searchParams.sector === 'string' ? searchParams.sector : undefined;
  const baseUrl = process.env.NEXTAUTH_URL || process.env.FRONTEND_URL || '';
  const res = await fetch(`${baseUrl}/api/feed${sector ? `?sector=${encodeURIComponent(sector)}` : ''}`, {
    cache: 'no-store'
  });
  const data = await res.json();
  const posts: any[] = data.data || [];
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-2xl font-semibold">Community Feed{sector ? ` – ${sector}` : ''}</h2>
        <SectorFilter />
      </div>
      {/* Create post form for signed in users */}
      <CreatePostForm sector={sector} />
      {posts.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post._id}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{post.userId.username}</span>
                <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <p className="mb-2 whitespace-pre-wrap">{post.content}</p>
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {post.images.map((src: string, i: number) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt="Post image" className="rounded-md" />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
