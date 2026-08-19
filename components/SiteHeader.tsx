export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-sm font-semibold tracking-tight">
          AI Job Application Builder
        </span>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a href="#roadmap" className="hover:text-foreground">
            Roadmap
          </a>
          <a
            href="https://github.com/AbhishekKumar1709/AI-Job-Application-Builder"
            className="hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
