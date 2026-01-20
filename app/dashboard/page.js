// app/dashboard/page.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Please log in with Discord to access your dashboard.</p>
        <a href="/api/auth/signin" className="text-blue-500">Log In</a>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { listings: true, teams: true },
  });

  let billingStatus = 'Not Subscribed';
  if (user?.stripeSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    billingStatus = subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.name}</h1>
      <p>Manage your talent, teams, listings, and billing.</p>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded"><h3 className="font-bold">Listings</h3><p>{user?.listings.length || 0}</p></div>
          <div className="p-4 border rounded"><h3 className="font-bold">Teams</h3><p>{user?.teams.length || 0}</p></div>
          <div className="p-4 border rounded"><h3 className="font-bold">Billing</h3><p>{billingStatus}</p></div>
        </div>
      </section>

      {user?.listings.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Listings</h2>
          <table className="min-w-full border-collapse border">
            <thead><tr><th className="border p-2">Title</th><th className="border p-2">Description</th><th className="border p-2">Price (GBP)</th><th className="border p-2">Actions</th></tr></thead>
            <tbody>
              {user.listings.map((listing) => (
                <tr key={listing.id}>
                  <td className="border p-2">{listing.title}</td>
                  <td className="border p-2">{listing.description}</td>
                  <td className="border p-2">£{listing.price}</td>
                  <td className="border p-2"><a href={`/listings/${listing.id}/edit`} className="text-blue-500">Edit</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <ul className="list-disc pl-5">
          <li><a href="/billing" className="text-blue-500">Manage Billing</a> (Plans: Pro £{process.env.PLAN_PRO_MONTHLY_GBP}, Ult £{process.env.PLAN_ULT_MONTHLY_GBP})</li>
          <li><a href="/boosts" className="text-blue-500">Buy Boost (24h £{process.env.BOOST_24H_GBP}, etc.)</a></li>
          <li><a href="/teams/new" className="text-blue-500">Create Team (Base £{process.env.TEAM_BASE_GBP})</a></li>
          <li><a href={process.env.PUBLIC_DISCORD_INVITE_URL} className="text-blue-500">Join Discord</a></li>
        </ul>
      </section>
    </div>
  );
}
