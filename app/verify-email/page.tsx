"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"verifying" | "done" | "error">(token ? "verifying" : "error");
  const [error, setError] = useState<string | null>(
    token ? null : "This verification link is missing its token.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Something went wrong.");
          setStatus("error");
          return;
        }
        setStatus("done");
      })
      .catch(() => {
        setError("Something went wrong.");
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-24">
        <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>

        {status === "verifying" && <p className="mt-4 text-sm text-muted">Verifying…</p>}

        {status === "done" && (
          <>
            <p className="mt-4 text-sm text-green-600">Your email has been verified.</p>
            <Link href="/dashboard" className="mt-6 text-sm text-accent hover:underline">
              Go to dashboard
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p className="mt-4 text-sm text-red-500">{error}</p>
            <Link href="/account" className="mt-6 text-sm text-accent hover:underline">
              Go to account settings to request a new link
            </Link>
          </>
        )}
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
