"use client";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const regions = [
  { value: '', label: 'All Regions' },
  { value: 'NA', label: 'North America' },
  { value: 'EU', label: 'Europe' },
  { value: 'UKIE', label: 'UK & Ireland' },
  { value: 'OCE', label: 'Oceania' },
  { value: 'BR', label: 'Brazil' },
  { value: 'LATAM', label: 'Latin America' },
  { value: 'MENA', label: 'Middle East & North Africa' },
  { value: 'APAC', label: 'Asia Pacific' },
  { value: 'SEA', label: 'South East Asia' },
  { value: 'IN', label: 'India' },
  { value: 'AF', label: 'Africa' }
];

export default function RegionFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRegion = searchParams.get('region') || '';
  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('region', value);
    } else {
      params.delete('region');
    }
    router.push(`${pathname}?${params.toString()}`);
  };
  return (
    <select
      value={currentRegion}
      onChange={e => handleChange(e.target.value)}
      className="w-full md:w-auto mt-2 md:mt-0 md:ml-2 border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      {regions.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
