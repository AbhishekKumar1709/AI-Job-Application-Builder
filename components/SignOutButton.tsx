"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
    >
      Sign out
    </button>
  );
}
