import './globals.css';
import { ReactNode } from 'react';
import Providers from '../components/Providers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'FreeAgentsLTD',
  description: 'Sector based esports platform for finding teams and players'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
