"use client";

import { useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const attemptedRef = useRef(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/feed";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
      return;
    }

    if (status === "unauthenticated" && !attemptedRef.current) {
      attemptedRef.current = true;
      void signIn("discord", { callbackUrl });
    }
  }, [status, callbackUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center">
        <h1 className="mb-2 text-2xl font-semibold">Signing you in</h1>
        <p className="text-slate-400">Redirecting to Discord…</p>
      </div>
    </div>
  );
}
