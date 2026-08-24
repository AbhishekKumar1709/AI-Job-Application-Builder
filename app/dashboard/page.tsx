import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";

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

  const stats = [
    {
      label: "Resumes",
      value: resumeCount,
      bg: "bg-icon-purple-bg",
      text: "text-icon-purple-text",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <line x1="8" y1="8" x2="16" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="13" y2="16" />
        </svg>
      ),
    },
    {
      label: "Applications",
      value: applicationCount,
      bg: "bg-icon-blue-bg",
      text: "text-icon-blue-text",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      ),
    },
    {
      label: "Interviewing",
      value: interviewing,
      bg: "bg-icon-orange-bg",
      text: "text-icon-orange-text",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
    },
    {
      label: "Offers",
      value: offers,
      bg: "bg-icon-green-bg",
      text: "text-icon-green-text",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-24">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-4 text-muted">Signed in as {session.user.email}.</p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} ${stat.text}`}>
                {stat.icon}
              </div>
              <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profile"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Edit profile
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
    </div>
  );
}
