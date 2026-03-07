"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';

interface Contract {
  _id: string;
  title: string;
  participantIds: string[];
  state: string;
}

interface ContractVersion {
  _id: string;
  versionNumber: number;
  content: string;
  signedBy: string[];
  createdAt: string;
}

interface Props {
  contract: Contract;
  versions: ContractVersion[];
}

/**
 * Client component that renders the details of a contract and provides
 * controls to update the draft content, propose a new version, accept or
 * archive the contract. After each action the page is refreshed.
 */
export default function ContractDetail({ contract, versions }: Props) {
  const router = useRouter();
  const latest = versions && versions.length > 0 ? versions[0] : null;
  const [content, setContent] = useState(latest?.content || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contract._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update contract');
      } else {
        router.refresh();
      }
    } catch (err) {
      setError('Failed to update contract');
    } finally {
      setLoading(false);
    }
  }

  async function doAction(action: 'propose' | 'accept' | 'archive') {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contract._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update contract');
      } else {
        router.refresh();
      }
    } catch (err) {
      setError('Failed to update contract');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-xl font-semibold mb-2">{contract.title}</h3>
        <p className="text-sm text-gray-500 mb-2">State: {contract.state}</p>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Edit Draft Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
            className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
          />
        </div>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleUpdate} disabled={loading || !content.trim()}>
            Save Draft
          </Button>
          <Button onClick={() => doAction('propose')} disabled={loading} variant="secondary">
            Propose
          </Button>
          <Button onClick={() => doAction('accept')} disabled={loading} variant="secondary">
            Accept
          </Button>
          <Button onClick={() => doAction('archive')} disabled={loading} variant="ghost">
            Archive
          </Button>
        </div>
      </div>
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h4 className="text-lg font-semibold mb-2">Version History</h4>
        {versions.length === 0 && <p className="text-sm text-gray-600 dark:text-gray-400">No versions yet.</p>}
        <ul className="space-y-2">
          {versions.map(v => (
            <li key={v._id} className="border border-gray-200 dark:border-gray-700 rounded-md p-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Version {v.versionNumber}</span>
                <span className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleString()}</span>
              </div>
              <pre className="whitespace-pre-wrap text-sm overflow-x-auto">
                {v.content}
              </pre>
              {v.signedBy && v.signedBy.length > 0 && (
                <p className="text-xs mt-1 text-gray-500">Signed by: {v.signedBy.join(', ')}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}