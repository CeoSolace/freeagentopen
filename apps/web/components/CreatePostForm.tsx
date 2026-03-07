"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Input from './Input';
import Button from './Button';

interface Props {
  sector?: string;
}

/**
 * A simple form for creating a post on the feed. When submitted the post is
 * sent to the API and the list is refreshed. Errors are shown inline.
 */
export default function CreatePostForm({ sector }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError('Post cannot be empty');
      return;
    }
    try {
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: sector || undefined, content })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to post');
        return;
      }
      setContent('');
      router.refresh();
    } catch (err) {
      setError('Failed to post');
    }
  };
  if (!session) return null;
  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-6">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Share an update..."
        rows={3}
        className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={!content.trim()}>Post</Button>
      </div>
    </form>
  );
}
