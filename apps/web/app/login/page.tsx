"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/feed";

  useEffect(() => {
    signIn("discord", { callbackUrl });
  }, [callbackUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center">
        <h1 className="mb-2 text-2xl font-semibold">Redirecting to Discord</h1>
        <p className="text-slate-400">
          Please wait while we sign you in.
        </p>
      </div>
    </div>
  );
}
