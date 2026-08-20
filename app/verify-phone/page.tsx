"use client";

import { useState, type FormEvent } from "react";

export default function VerifyPhonePage() {
  const [step, setStep] = useState<"enter-phone" | "enter-otp" | "verified">("enter-phone");
  const [mobile, setMobile] = useState("91");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to send OTP.");
      return;
    }

    setStep("enter-otp");
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to verify OTP.");
      return;
    }

    setStep("verified");
  }

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">Verify phone (test)</h1>
      <p className="mt-1 text-sm text-muted">
        Standalone test page for the MSG91 OTP integration — not yet wired
        into signup/login.
      </p>

      {step === "enter-phone" && (
        <form onSubmit={handleSendOtp} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Mobile number (with country code, digits only)
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send OTP"}
          </button>
        </form>
      )}

      {step === "enter-otp" && (
        <form onSubmit={handleVerifyOtp} className="mt-8 flex flex-col gap-4">
          <p className="text-sm text-muted">OTP sent to {mobile}.</p>
          <label className="flex flex-col gap-1 text-sm">
            Enter OTP
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
        </form>
      )}

      {step === "verified" && (
        <p className="mt-8 text-sm text-green-600">
          Phone number verified successfully.
        </p>
      )}
    </main>
  );
}
