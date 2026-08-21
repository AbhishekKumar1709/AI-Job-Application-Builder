"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ExperienceSection } from "./profile/ExperienceSection";
import { EducationSection } from "./profile/EducationSection";
import { SkillsSection } from "./profile/SkillsSection";
import { buttonClass, inputClass, type Experience, type Education, type Skill } from "./profile/types";

type BasicInfo = {
  title: string;
  headline: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
};

export function ResumeEditor({ resumeId }: { resumeId: string }) {
  const apiBase = `/api/resumes/${resumeId}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [basic, setBasic] = useState<BasicInfo>({ title: "", headline: "", phone: "", location: "", summary: "" });
  const [savingBasic, setSavingBasic] = useState(false);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetch(apiBase)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const resume = data.resume;
        setBasic({
          title: resume.title,
          headline: resume.headline ?? "",
          phone: resume.phone ?? "",
          location: resume.location ?? "",
          summary: resume.summary ?? "",
        });
        setExperiences(resume.experiences ?? []);
        setEducation(resume.education ?? []);
        setSkills(resume.skills ?? []);
      })
      .catch(() => setError("Failed to load resume."))
      .finally(() => setLoading(false));
  }, [apiBase]);

  async function handleSaveBasic(event: FormEvent) {
    event.preventDefault();
    setSavingBasic(true);
    setError(null);

    const res = await fetch(apiBase, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basic),
    });

    setSavingBasic(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save resume.");
    }
  }

  if (loading) {
    return <p className="mt-8 text-sm text-muted">Loading…</p>;
  }

  if (notFound) {
    return <p className="mt-8 text-sm text-red-500">Resume not found.</p>;
  }

  return (
    <div className="mt-8 flex flex-col gap-12">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <section>
        <h2 className="text-lg font-semibold">Basic info</h2>
        <form onSubmit={handleSaveBasic} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Resume title
            <input
              type="text"
              required
              placeholder="e.g. Backend Engineer — Acme application"
              value={basic.title}
              onChange={(e) => setBasic({ ...basic, title: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Headline
            <input
              type="text"
              value={basic.headline ?? ""}
              onChange={(e) => setBasic({ ...basic, headline: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Phone
            <input
              type="tel"
              value={basic.phone ?? ""}
              onChange={(e) => setBasic({ ...basic, phone: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Location
            <input
              type="text"
              value={basic.location ?? ""}
              onChange={(e) => setBasic({ ...basic, location: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Summary
            <textarea
              rows={4}
              value={basic.summary ?? ""}
              onChange={(e) => setBasic({ ...basic, summary: e.target.value })}
              className={inputClass}
            />
          </label>
          <button type="submit" disabled={savingBasic} className={`${buttonClass} self-start`}>
            {savingBasic ? "Saving…" : "Save"}
          </button>
        </form>
      </section>

      <ExperienceSection apiBase={apiBase} experiences={experiences} setExperiences={setExperiences} setError={setError} />
      <EducationSection apiBase={apiBase} education={education} setEducation={setEducation} setError={setError} />
      <SkillsSection apiBase={apiBase} skills={skills} setSkills={setSkills} setError={setError} />
    </div>
  );
}
