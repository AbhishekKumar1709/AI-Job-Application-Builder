type RoadmapItem = {
  title: string;
  description: string;
  status: "Planned" | "In Progress";
};

const items: RoadmapItem[] = [
  {
    title: "Master profile",
    description:
      "Enter your work history, education, and skills once, and reuse them across every resume.",
    status: "Planned",
  },
  {
    title: "Resume builder & templates",
    description: "Build and edit a resume from your profile with a choice of templates, exported to PDF.",
    status: "Planned",
  },
  {
    title: "Upload an existing resume",
    description: "Import a PDF or DOCX resume and turn it into an editable profile.",
    status: "Planned",
  },
  {
    title: "AI optimization & ATS check",
    description: "Get AI suggestions to tighten wording and check compatibility with applicant tracking systems.",
    status: "Planned",
  },
  {
    title: "Cover letter generation",
    description: "Generate a tailored cover letter from your profile and a job description.",
    status: "Planned",
  },
  {
    title: "Application tracker",
    description: "Track every application's status, dates, and which resume version you sent.",
    status: "Planned",
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight">Roadmap</h2>
        <p className="mt-2 text-muted">
          Nothing below is built yet — this is the plan, tracked in{" "}
          <a
            href="https://github.com/AbhishekKumar1709/AI-Job-Application-Builder/blob/master/FEATURES.md"
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
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
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
