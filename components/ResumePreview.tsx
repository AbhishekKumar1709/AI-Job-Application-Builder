"use client";

import { useEffect, useState } from "react";

type Experience = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
};

type Education = {
  id: string;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
};

type Skill = { id: string; name: string };

type Resume = {
  headline: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  template: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
};

function fmtMonth(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function ResumePreview({
  resumeId,
  userName,
  userEmail,
}: {
  resumeId: string;
  userName: string | null;
  userEmail: string | null;
}) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/resumes/${resumeId}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setResume(data.resume);
      })
      .finally(() => setLoading(false));
  }, [resumeId]);

  if (loading) {
    return <p className="mt-8 text-sm text-muted">Loading…</p>;
  }

  if (notFound || !resume) {
    return <p className="mt-8 text-sm text-red-500">Resume not found.</p>;
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => window.print()}
        className="no-print mb-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        Download / print PDF
      </button>

      {resume.template === "compact" ? (
        <CompactTemplate resume={resume} userName={userName} userEmail={userEmail} />
      ) : (
        <ClassicTemplate resume={resume} userName={userName} userEmail={userEmail} />
      )}
    </div>
  );
}

function ClassicTemplate({
  resume,
  userName,
  userEmail,
}: {
  resume: Resume;
  userName: string | null;
  userEmail: string | null;
}) {
  const contactLine = [userEmail, resume.phone, resume.location].filter(Boolean).join(" · ");

  return (
    <article className="resume-doc rounded-lg border border-border bg-background p-10 text-sm leading-relaxed text-foreground">
      <header>
        <h1 className="text-2xl font-bold">{userName || userEmail || "Resume"}</h1>
        {resume.headline && <p className="mt-1 text-base text-muted">{resume.headline}</p>}
        {contactLine && <p className="mt-2 text-xs text-muted">{contactLine}</p>}
      </header>

      {resume.summary && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Summary</h2>
          <p className="mt-2">{resume.summary}</p>
        </section>
      )}

      {resume.experiences.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Experience</h2>
          <div className="mt-2 flex flex-col gap-4">
            {resume.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <p className="font-medium">
                    {exp.title} · {exp.company}
                    {exp.location ? `, ${exp.location}` : ""}
                  </p>
                  <p className="whitespace-nowrap text-xs text-muted">
                    {fmtMonth(exp.startDate)} – {exp.current ? "Present" : fmtMonth(exp.endDate)}
                  </p>
                </div>
                {exp.description && <p className="mt-1 text-muted">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.education.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Education</h2>
          <div className="mt-2 flex flex-col gap-3">
            {resume.education.map((edu) => (
              <div key={edu.id} className="flex items-baseline justify-between">
                <p className="font-medium">
                  {edu.institution}
                  {edu.degree ? ` · ${edu.degree}` : ""}
                  {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                </p>
                <p className="whitespace-nowrap text-xs text-muted">
                  {fmtMonth(edu.startDate)} – {fmtMonth(edu.endDate)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.skills.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Skills</h2>
          <p className="mt-2">{resume.skills.map((s) => s.name).join(" · ")}</p>
        </section>
      )}
    </article>
  );
}

function CompactTemplate({
  resume,
  userName,
  userEmail,
}: {
  resume: Resume;
  userName: string | null;
  userEmail: string | null;
}) {
  return (
    <article className="resume-doc rounded-lg border border-border bg-background p-8 text-xs leading-snug text-foreground">
      <header className="flex items-start justify-between border-b-2 border-accent pb-3">
        <div>
          <h1 className="text-xl font-bold">{userName || userEmail || "Resume"}</h1>
          {resume.headline && <p className="text-sm text-accent">{resume.headline}</p>}
        </div>
        <div className="text-right text-xs text-muted">
          {userEmail && <p>{userEmail}</p>}
          {resume.phone && <p>{resume.phone}</p>}
          {resume.location && <p>{resume.location}</p>}
        </div>
      </header>

      {resume.summary && <p className="mt-3 text-xs">{resume.summary}</p>}

      {resume.experiences.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-accent">Experience</h2>
          <div className="mt-1.5 flex flex-col gap-2.5">
            {resume.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">
                    {exp.title}
                    <span className="font-normal text-muted"> — {exp.company}{exp.location ? `, ${exp.location}` : ""}</span>
                  </p>
                  <p className="whitespace-nowrap text-[10px] text-muted">
                    {fmtMonth(exp.startDate)}–{exp.current ? "Present" : fmtMonth(exp.endDate)}
                  </p>
                </div>
                {exp.description && <p className="text-muted">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.education.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-accent">Education</h2>
          <div className="mt-1.5 flex flex-col gap-1.5">
            {resume.education.map((edu) => (
              <div key={edu.id} className="flex items-baseline justify-between">
                <p className="font-semibold">
                  {edu.institution}
                  <span className="font-normal text-muted">
                    {edu.degree ? ` — ${edu.degree}` : ""}
                    {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                  </span>
                </p>
                <p className="whitespace-nowrap text-[10px] text-muted">
                  {fmtMonth(edu.startDate)}–{fmtMonth(edu.endDate)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.skills.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-accent">Skills</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {resume.skills.map((s) => (
              <span key={s.id} className="rounded-full border border-accent px-2 py-0.5 text-[10px] text-accent">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
