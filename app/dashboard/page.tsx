import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/AppSidebar";

const STATUS_LABEL: Record<string, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [resumeCount, applicationCount, statusCounts, recentResumes, recentApplications, latestResume] =
    await Promise.all([
      prisma.resume.count({ where: { userId } }),
      prisma.application.count({ where: { userId } }),
      prisma.application.groupBy({ by: ["status"], where: { userId }, _count: true }),
      prisma.resume.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 4,
        select: { id: true, title: true, updatedAt: true },
      }),
      prisma.application.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 4,
        select: { id: true, company: true, role: true, status: true, updatedAt: true },
      }),
      prisma.resume.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" }, select: { id: true } }),
    ]);

  const interviewing = statusCounts.find((s) => s.status === "INTERVIEWING")?._count ?? 0;
  const offers = statusCounts.find((s) => s.status === "OFFER")?._count ?? 0;
  const applied = statusCounts.find((s) => s.status === "APPLIED")?._count ?? 0;

  const resumeToolsHref = latestResume ? `/resumes/${latestResume.id}` : "/resumes";

  const activity = [
    ...recentResumes.map((r) => ({
      key: `resume-${r.id}`,
      href: `/resumes/${r.id}`,
      label: `Resume updated: ${r.title}`,
      date: r.updatedAt,
    })),
    ...recentApplications.map((a) => ({
      key: `application-${a.id}`,
      href: "/applications",
      label: `${a.role} at ${a.company} — ${STATUS_LABEL[a.status] ?? a.status}`,
      date: a.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
      label: "Interviews",
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

  const quickActions = [
    {
      label: "Create resume",
      description: "Start a new resume from your profile",
      href: "/resumes",
      bg: "bg-icon-purple-bg",
      text: "text-icon-purple-text",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      label: "Check ATS score",
      description: "See how a resume scores against ATS filters",
      href: resumeToolsHref,
      bg: "bg-icon-green-bg",
      text: "text-icon-green-text",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      label: "Generate cover letter",
      description: "Write a tailored letter with AI",
      href: resumeToolsHref,
      bg: "bg-icon-orange-bg",
      text: "text-icon-orange-text",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      ),
    },
    {
      label: "Add application",
      description: "Track a new job you've applied to",
      href: "/applications",
      bg: "bg-icon-blue-bg",
      text: "text-icon-blue-text",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      ),
    },
  ];

  const funnel = [
    { label: "Applied", value: applied },
    { label: "Interviewing", value: interviewing },
    { label: "Offers", value: offers },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <AppSidebar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Good to see you back 👋</h1>
        <p className="mt-1 text-muted">
          {applicationCount === 0 && resumeCount === 0
            ? "Let's get started — build your first resume."
            : `You have ${applicationCount} tracked application${applicationCount === 1 ? "" : "s"} and ${resumeCount} resume${resumeCount === 1 ? "" : "s"} ready to go.`}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg} ${stat.text}`}>
                {stat.icon}
              </div>
              <p className="mt-2 text-xl font-semibold">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-sm font-semibold text-muted">Quick actions</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-accent/50 hover:bg-surface"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.bg} ${action.text}`}>
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section>
            <h2 className="text-sm font-semibold text-muted">Recent activity</h2>
            <div className="mt-3 flex flex-col gap-2">
              {activity.length === 0 && (
                <p className="rounded-xl border border-border p-4 text-sm text-muted">
                  Nothing yet — activity will show up here once you build a resume or track an application.
                </p>
              )}
              {activity.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border border-border p-3 text-sm transition-colors hover:border-accent/50 hover:bg-surface"
                >
                  <span>{item.label}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-muted">Application progress</h2>
            {applicationCount === 0 ? (
              <p className="mt-3 rounded-xl border border-border p-4 text-sm text-muted">
                Track your first application to see your progress here.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-3 rounded-xl border border-border p-4">
                {funnel.map((f) => (
                  <div key={f.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{f.label}</span>
                      <span className="text-muted">{f.value}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-border">
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${(f.value / funnelMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
