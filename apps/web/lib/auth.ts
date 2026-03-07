'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-600/20 border border-red-500/30 px-4 py-3 text-sm text-red-200">
            Discord sign-in failed. Wait a few minutes, then try again once.
          </div>
        )}

        <button
          onClick={() => signIn('discord')}
          className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 transition px-4 py-3 font-medium"
        >
          Sign in with Discord
        </button>
      </div>
    </div>
  );
}
