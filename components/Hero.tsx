import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="mb-4 inline-block rounded-full border border-border px-3 py-1 text-xs text-muted">
        Early development — accounts work, resume tools don&apos;t yet
      </p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Build a resume that actually gets you hired
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
        An AI-assisted tool for writing resumes and cover letters, checking
        ATS compatibility, matching your resume to a job description, and
        tracking every application in one place.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
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
          See what&apos;s planned
        </a>
      </div>
    </section>
  );
}
