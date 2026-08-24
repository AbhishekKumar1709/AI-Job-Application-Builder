type RoadmapItem = {
  title: string;
  description: string;
  status: "Live";
};

const items: RoadmapItem[] = [
  {
    title: "Master profile",
    description:
      "Enter your work history, education, and skills once, and reuse them across every resume.",
    status: "Live",
  },
  {
    title: "Resume builder & templates",
    description: "Build and edit a resume from your profile, choose a template, and export to PDF.",
    status: "Live",
  },
  {
    title: "Upload an existing resume",
    description: "Import a PDF or DOCX resume and turn it into an editable profile.",
    status: "Live",
  },
  {
    title: "AI optimization & ATS check",
    description: "Get AI suggestions to tighten wording and check compatibility with applicant tracking systems.",
    status: "Live",
  },
  {
    title: "Cover letter generation",
    description: "Generate a tailored cover letter from your profile and a job description.",
    status: "Live",
  },
  {
    title: "Application tracker",
    description: "Track every application's status, dates, and which resume version you sent.",
    status: "Live",
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight">What&apos;s here</h2>
        <p className="mt-2 text-muted">
          Everything below is live. Full details tracked in{" "}
          <a
            href="https://github.com/AbhishekKumar1709/CVRespire/blob/master/FEATURES.md"
            className="underline underline-offset-2 hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            FEATURES.md
          </a>
          .
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{item.title}</h3>
                <span className="rounded-full border border-accent px-2 py-0.5 text-xs text-accent">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
