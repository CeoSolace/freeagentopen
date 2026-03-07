"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import Button from '../../../components/Button';

/**
 * Discord verification page. Handles the Discord OAuth callback token and
 * allows the user to verify their membership. If the user is not signed in
 * they are prompted to authenticate with Discord first. Once signed in they
 * can authorize the verification by calling the backend API.
 */
export default function DiscordVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Invalid Verification Link</h2>
        <p className="mb-4">The verification token is missing or invalid.</p>
      </div>
    );
  }
  if (status === 'loading') {
    return <p className="text-center py-12">Loading...</p>;
  }
  // If not signed in prompt to sign in with Discord
  if (!session) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-semibold">Sign in to Verify</h2>
        <p>You must sign in with Discord before you can verify your membership.</p>
        <Button onClick={() => signIn('discord', { callbackUrl: `/verify/discord?token=${token}` })}>
          Sign in with Discord
        </Button>
      </div>
    );
  }
  // If signed in allow verification
  async function handleVerify() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/verify/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="text-center py-12 space-y-4">
      <h2 className="text-2xl font-semibold">Discord Verification</h2>
      <p className="">Click the button below to authorize your Discord account and join the guild.</p>
      {error && <p className="text-red-600">{error}</p>}
      <Button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Authorize'}
      </Button>
    </div>
  );
}