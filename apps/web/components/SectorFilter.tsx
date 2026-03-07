"use client";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const sectors = [
  { value: '', label: 'All Sectors' },
  { value: 'fortnite', label: 'Fortnite' },
  { value: 'valorant', label: 'Valorant' },
  { value: 'cod', label: 'Call of Duty' },
  { value: 'r6', label: 'Rainbow Six Siege' },
  { value: 'rocket_league', label: 'Rocket League' },
  { value: 'lol', label: 'League of Legends' }
];

export default function SectorFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSector = searchParams.get('sector') || '';
  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('sector', value);
    } else {
      params.delete('sector');
    }
    router.push(`${pathname}?${params.toString()}`);
  };
  return (
    <select
      value={currentSector}
      onChange={e => handleChange(e.target.value)}
      className="w-full md:w-auto mt-2 md:mt-0 md:ml-auto border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      {sectors.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
