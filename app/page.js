// app/page.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-50 flex flex-col items-center justify-center px-6 py-16">
      <header className="text-center mb-16 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-extrabold text-indigo-800 mb-6 tracking-tight">FreeAgents Platform</h1>
        <p className="text-xl md:text-3xl text-gray-700 font-light leading-relaxed">Connect with elite freelance sports talent. Enjoy secure payments, dynamic listings, and seamless community integration.</p>
      </header>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Link href="/pricing" className="bg-indigo-600 text-white px-10 py-4 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 font-semibold text-lg">
          Explore Pricing
        </Link>
        <Link href="/auth/signin" className="bg-green-600 text-white px-10 py-4 rounded-lg shadow-md hover:bg-green-700 transition duration-300 font-semibold text-lg">
          Sign In
        </Link>
      </div>
      <p className="text-sm text-gray-500 italic max-w-md text-center">
        Sign-up and Sign-in features are coming soon. Currently, they are available only for admins.
      </p>
      <section className="mt-20 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-indigo-800 mb-10 text-center">Why Choose FreeAgents?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-indigo-700 mb-4">Secure Payments</h3>
            <p className="text-gray-600">Reliable and encrypted transactions for peace of mind.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-indigo-700 mb-4">Dynamic Listings</h3>
            <p className="text-gray-600">Real-time updates and customizable search options.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-indigo-700 mb-4">Vibrant Community</h3>
            <p className="text-gray-600">Engage with professionals in a supportive network.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
