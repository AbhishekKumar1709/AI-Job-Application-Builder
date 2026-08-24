"use client";

import { useEffect, useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { buttonClass, inputClass, secondaryButtonClass } from "./profile/types";

type Account = { id: string; name: string | null; email: string; emailVerified: string | null; createdAt: string };

export function AccountSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => {
        setAccount(data.user);
        setName(data.user?.name ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveName(event: FormEvent) {
    event.preventDefault();
    setSavingName(true);
    setNameError(null);
    setNameSaved(false);

    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setSavingName(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setNameError(data.error ?? "Failed to save name.");
      return;
    }

    setNameSaved(true);
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordMessage(null);

    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setSavingPassword(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPasswordError(data.error ?? "Failed to change password.");
      return;
    }

    setPasswordMessage("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
  }

  async function handleResendVerification() {
    setResendingVerification(true);
    setVerificationMessage(null);
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    setResendingVerification(false);
    if (res.ok) {
      setVerificationMessage("Verification email sent — check your inbox.");
    } else {
      const data = await res.json().catch(() => ({}));
      setVerificationMessage(data.error ?? "Failed to send verification email.");
    }
  }

  async function handleDeleteAccount(event: FormEvent) {
    event.preventDefault();
    setDeleting(true);
    setDeleteError(null);

    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });

    setDeleting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error ?? "Failed to delete account.");
      return;
    }

    await signOut({ redirect: false });
    router.push("/");
  }

  if (loading) {
    return <p className="mt-8 text-sm text-muted">Loading…</p>;
  }

  if (!account) {
    return <p className="mt-8 text-sm text-red-500">Failed to load account.</p>;
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      <div>
        <p className="text-sm font-semibold text-muted">Account</p>
        <section className="mt-3 rounded-xl border border-border bg-surface p-6">
          <p className="text-sm text-muted">Email: {account.email}</p>
          {!account.emailVerified && (
            <div className="mt-2 rounded-lg border border-border bg-background p-3 text-sm">
              <p>Your email isn&apos;t verified yet.</p>
              <button
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className={`${secondaryButtonClass} mt-2`}
              >
                {resendingVerification ? "Sending…" : "Resend verification email"}
              </button>
              {verificationMessage && <p className="mt-2 text-muted">{verificationMessage}</p>}
            </div>
          )}

          <form onSubmit={handleSaveName} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </label>
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            {nameSaved && <p className="text-sm text-green-600">Saved.</p>}
            <button type="submit" disabled={savingName} className={`${buttonClass} self-start`}>
              {savingName ? "Saving…" : "Save name"}
            </button>
          </form>
        </section>
      </div>

      <div>
        <p className="text-sm font-semibold text-muted">Security</p>
        <section className="mt-3 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">Change password</h2>
          <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Current password
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              New password
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
              <span className="text-xs text-muted">At least 8 characters.</span>
            </label>
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
            <button type="submit" disabled={savingPassword} className={`${buttonClass} self-start`}>
              {savingPassword ? "Saving…" : "Change password"}
            </button>
          </form>
        </section>
      </div>

      <div>
        <p className="text-sm font-semibold text-muted">Data / Privacy</p>
        <section className="mt-3 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">Your data</h2>
          <p className="mt-1 text-sm text-muted">
            Download everything tied to your account — profile, resumes, and
            applications — as JSON.
          </p>
          <a href="/api/account/export" className={`${secondaryButtonClass} mt-3 inline-block`}>
            Export my data
          </a>
        </section>
      </div>

      <div>
        <p className="text-sm font-semibold text-red-500">Danger Zone</p>
        <section className="mt-3 rounded-xl border border-red-500/30 bg-surface p-6">
          <h2 className="text-lg font-semibold">Delete account</h2>
          <p className="mt-1 text-sm text-muted">
            Permanently deletes your account and everything tied to it —
            profile, resumes, applications, cover letters. This cannot be
            undone.
          </p>
          {!confirmingDelete ? (
            <button onClick={() => setConfirmingDelete(true)} className={`${secondaryButtonClass} mt-3`}>
              Delete my account
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="mt-3 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Enter your password to confirm
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className={inputClass}
                />
              </label>
              {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Permanently delete my account"}
                </button>
                <button type="button" onClick={() => setConfirmingDelete(false)} className={secondaryButtonClass}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
