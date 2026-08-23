import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [resumeCount, applicationCount, statusCounts] = await Promise.all([
    prisma.resume.count({ where: { userId } }),
    prisma.application.count({ where: { userId } }),
    prisma.application.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
  ]);

  const interviewing = statusCounts.find((s) => s.status === "INTERVIEWING")?._count ?? 0;
  const offers = statusCounts.find((s) => s.status === "OFFER")?._count ?? 0;

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col px-6 py-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <SignOutButton />
      </div>
      <p className="mt-4 text-muted">
        Signed in as {session.user.email}.
      </p>

      <div className="mt-6 grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-semibold">{resumeCount}</p>
          <p className="text-xs text-muted">Resumes</p>
        </div>
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-semibold">{applicationCount}</p>
          <p className="text-xs text-muted">Applications</p>
        </div>
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-semibold">{interviewing}</p>
          <p className="text-xs text-muted">Interviewing</p>
        </div>
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-semibold">{offers}</p>
          <p className="text-xs text-muted">Offers</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
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
        <Link
          href="/applications"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
        >
          Applications
        </Link>
        <Link
          href="/account"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
        >
          Account settings
        </Link>
      </div>
    </main>
  );
}
