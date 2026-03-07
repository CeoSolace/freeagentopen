"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface Profile {
  _id: string;
  sector: string;
  region: string;
  bio?: string;
}

interface Props {
  initialProfiles: Profile[];
}

export default function ManageLFT({ initialProfiles }: Props) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [form, setForm] = useState({ sector: sectors[0].value, region: regions[0], bio: '' });
  const [error, setError] = useState<string | null>(null);

  const createProfile = async () => {
    setError(null);
    try {
      const res = await fetch('/api/lft', {
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
      setProfiles([...profiles, data]);
      setForm({ sector: sectors[0].value, region: regions[0], bio: '' });
    } catch (err) {
      setError('Failed to create');
    }
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    try {
      const res = await fetch(`/api/lft/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const { data } = await res.json();
        setProfiles(profiles.map(p => (p._id === id ? data : p)));
      }
    } catch (err) {
      /* ignore */
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/lft/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProfiles(profiles.filter(p => p._id !== id));
      }
    } catch (err) {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Create LFT Profile</h2>
        <div className="grid md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              className="w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100"
              rows={2}
            />
          </div>
        </div>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        <Button onClick={createProfile} className="mt-2">Create Profile</Button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">My LFT Profiles</h2>
        {profiles.length === 0 && <p className="text-gray-600 dark:text-gray-400">You have not created any LFT profiles.</p>}
        {profiles.map(profile => (
          <div key={profile._id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold capitalize">{profile.sector}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Region: {profile.region}</p>
                {profile.bio && <p className="text-sm mt-1">{profile.bio}</p>}
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" onClick={() => deleteProfile(profile._id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
