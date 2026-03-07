"use client";
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Global provider wrapper. Place any client‑side providers here (e.g. SessionProvider, Toaster).
 */
export default function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
