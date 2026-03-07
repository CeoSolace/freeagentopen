"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

const navItems = [
  { href: '/feed', label: 'Feed' },
  { href: '/lft/browse', label: 'LFT' },
  { href: '/lfd/browse', label: 'LFD' },
  { href: '/messages', label: 'Messages' },
  { href: '/contracts', label: 'Contracts' },
  { href: '/support', label: 'Support' },
  { href: '/billing', label: 'Billing' }
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary">
          FreeAgentsLTD
        </Link>
        <div className="space-x-4 hidden md:flex">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={
                'px-3 py-2 rounded-md text-sm font-medium ' +
                (pathname?.startsWith(item.href)
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800')
              }
            >
              {item.label}
            </Link>
          ))}
          {session && (session.user as any).roles?.includes('ADMIN') && (
            <Link
              href="/admin"
              className={
                'px-3 py-2 rounded-md text-sm font-medium ' +
                (pathname?.startsWith('/admin')
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800')
              }
            >
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {status === 'loading' ? null : session ? (
            <>
              <Link href={`/profile/${session.user.id}`} className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300">
                {session.user.name || session.user.id}
              </Link>
              <button
                onClick={() => signOut()}
                className="px-3 py-2 text-sm rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('discord')}
              className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-dark"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
