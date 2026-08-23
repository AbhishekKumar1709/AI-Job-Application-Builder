import Link from "next/link";
import { HeroLaptop } from "./HeroLaptop";

const features = [
  {
    label: "AI Resume Builder",
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
    label: "ATS Checker",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "AI Cover Letters",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    ),
  },
  {
    label: "Job Match",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Application Tracker",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M4 6h16M4 12h16M4 18h10" />
        <circle cx="19" cy="18" r="2" />
      </svg>
    ),
  },
];

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <p className="mb-4 inline-block rounded-full border border-border px-3 py-1 text-xs text-muted">
            Live — profile, resume builder & templates, AI tools, and
            application tracking.
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Build a resume that{" "}
            <span className="bg-gradient-to-r from-accent to-foreground bg-clip-text text-transparent">
              actually gets you hired
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted lg:mx-0">
            An AI-assisted tool for writing resumes and cover letters, checking
            ATS compatibility, matching your resume to a job description, and
            tracking every application in one place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Link
              href="/signup"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Create an account
            </Link>
            <a
              href="#roadmap"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-surface"
            >
              See what&apos;s live
            </a>
          </div>
        </div>

        <HeroLaptop />
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-border pt-8 text-sm text-muted">
        {features.map((f) => (
          <span key={f.label} className="flex items-center gap-2">
            <span className="text-accent">{f.icon}</span>
            {f.label}
          </span>
        ))}
      </div>
    </section>
  );
}
