import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight hover:text-accent">
          CVRespire
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a href="#roadmap" className="hover:text-foreground">
            Features
          </a>
          <a
            href="https://github.com/AbhishekKumar1709/CVRespire"
            className="hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <Link href="/login" className="hover:text-foreground">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-accent px-3 py-1.5 text-accent-foreground hover:opacity-90"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
