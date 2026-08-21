import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col px-6 py-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <SignOutButton />
      </div>
      <p className="mt-4 text-muted">
        Signed in as {session.user.email}.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/profile"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Edit master profile
        </Link>
        <Link
          href="/resumes"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
        >
          My resumes
        </Link>
      </div>
    </main>
  );
}
