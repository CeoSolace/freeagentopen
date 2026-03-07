"use client";
import { useState } from 'react';
import Button from './Button';

const sectors = [
  { value: 'fortnite', label: 'Fortnite' },
  { value: 'valorant', label: 'Valorant' },
  { value: 'cod', label: 'Call of Duty' },
  { value: 'r6', label: 'Rainbow Six Siege' },
  { value: 'rocket_league', label: 'Rocket League' },
  { value: 'lol', label: 'League of Legends' }
];

const regions = [
  'NA',
  'EU',
  'UKIE',
  'OCE',
  'BR',
  'LATAM',
  'MENA',
  'APAC',
  'SEA',
  'IN',
  'AF'
];

interface Listing {
  _id: string;
  sector: string;
  region: string;
  title: string;
  description?: string;
}

interface Props {
  initialListings: Listing[];
}

export default function ManageLFD({ initialListings }: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [form, setForm] = useState({ sector: sectors[0].value, region: regions[0], title: '', description: '' });
  const [error, setError] = useState<string | null>(null);

  const createListing = async () => {
    setError(null);
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      const res = await fetch('/api/lfd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create');
        return;
      }
      const { data } = await res.json();
      setListings([...listings, data]);
      setForm({ sector: sectors[0].value, region: regions[0], title: '', description: '' });
    } catch (err) {
      setError('Failed to create');
    }
  };

  const deleteListing = async (id: string) => {
    try {
      const res = await fetch(`/api/lfd/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setListings(listings.filter(l => l._id !== id));
      }
    } catch (err) {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Create LFD Listing</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sector</label>
            <select
              value={form.sector}
              onChange={e => setForm({ ...form, sector: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
            >
              {sectors.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Region</label>
            <select
              value={form.region}
              onChange={e => setForm({ ...form, region: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
            >
              {regions.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        <Button onClick={createListing} className="mt-2">Create Listing</Button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">My LFD Listings</h2>
        {listings.length === 0 && <p className="text-gray-600 dark:text-gray-400">You have not created any LFD listings.</p>}
        {listings.map(listing => (
          <div key={listing._id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold capitalize">{listing.sector}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Region: {listing.region}</p>
                <p className="text-sm mt-1">{listing.title}</p>
                {listing.description && <p className="text-sm">{listing.description}</p>}
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" onClick={() => deleteListing(listing._id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
