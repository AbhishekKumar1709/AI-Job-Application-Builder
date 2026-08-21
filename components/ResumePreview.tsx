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
  title: string;
  headline: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
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

  const contactLine = [userEmail, resume.phone, resume.location].filter(Boolean).join(" · ");

  return (
    <div className="mt-6">
      <button
        onClick={() => window.print()}
        className="no-print mb-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        Download / print PDF
      </button>

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
    </div>
  );
}
