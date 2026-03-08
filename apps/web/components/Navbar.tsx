"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/feed", label: "Feed" },
  { href: "/lft/browse", label: "LFT" },
  { href: "/lfd/browse", label: "LFD" },
  { href: "/messages", label: "Messages" },
  { href: "/contracts", label: "Contracts" },
  { href: "/support", label: "Support" },
  { href: "/billing", label: "Billing" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const roles = ((session?.user as any)?.roles || []) as string[];
  const isAdmin = roles.includes("OWNER") || roles.includes("ADMIN");

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-semibold text-blue-600">
          FreeAgentsLTD
        </Link>

        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "font-medium text-black" : "text-gray-600 hover:text-black"}
              >
                {item.label}
              </Link>
            );
          })}

          {isAdmin ? (
            <Link href="/admin" className="text-gray-600 hover:text-black">
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {status === "loading" ? null : session ? (
            <>
              <span className="hidden text-sm text-gray-700 md:inline">
                {session.user?.name || (session.user as any)?.id}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-800 hover:bg-gray-300"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => signIn("discord", { callbackUrl: "/feed" })}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
