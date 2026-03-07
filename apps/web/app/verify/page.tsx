import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';

/**
 * Generic verify page that informs the user they must complete verification
 * before continuing. Instructs them to use their Discord verification link.
 */
export default async function VerifyPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  return (
    <div className="text-center py-12">
      <h2 className="text-3xl font-semibold mb-4">Verification Required</h2>
      <p className="mb-4">Your account must be verified via Discord before you can use all features.</p>
      <p className="mb-4">
        Please check your Discord messages for a verification link. Once verified you will gain full access.
      </p>
      <Link href="/" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark">
        Return Home
      </Link>
    </div>
  );
}