"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function AppHeader() {
  const { status } = useSession();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight hover:text-accent"
        >
          CVBreathe
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-border px-3 py-1.5 hover:bg-surface"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-accent px-3 py-1.5 text-accent-foreground hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
