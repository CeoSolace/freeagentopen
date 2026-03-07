"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';

/**
 * Form to create a new contract. The user provides a title, a comma‑separated
 * list of participant user IDs and the initial contract body. Upon
 * successful creation the user is redirected to the new contract's detail page.
 */
export default function CreateContractForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [participants, setParticipants] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    setLoading(true);
    try {
      const participantIds = participants
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), participantIds, content: content.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create contract');
      } else {
        router.push(`/contracts/${data.data._id}`);
      }
    } catch (err) {
      setError('Failed to create contract');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-2">Create New Contract</h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Participant IDs (comma separated)</label>
        <input
          type="text"
          value={participants}
          onChange={e => setParticipants(e.target.value)}
          placeholder="Enter user IDs separated by commas"
          className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Contract Content</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
          Create Contract
        </Button>
      </div>
    </form>
  );
}