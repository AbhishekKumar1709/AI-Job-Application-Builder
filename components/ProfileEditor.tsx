"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ExperienceSection } from "./profile/ExperienceSection";
import { EducationSection } from "./profile/EducationSection";
import { SkillsSection } from "./profile/SkillsSection";
import {
  buttonClass,
  secondaryButtonClass,
  inputClass,
  JOB_TITLE_SUGGESTIONS,
  type Experience,
  type Education,
  type Skill,
} from "./profile/types";

const API_BASE = "/api/profile";

type BasicInfo = {
  headline: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
};

const STEPS = ["Basic Info", "Experience", "Education", "Skills"];

export function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const [basic, setBasic] = useState<BasicInfo>({ headline: "", phone: "", location: "", summary: "" });
  const [savingBasic, setSavingBasic] = useState(false);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetch(API_BASE)
      .then((res) => res.json())
      .then((data) => {
        const profile = data.profile;
        if (profile) {
          setBasic({
            headline: profile.headline ?? "",
            phone: profile.phone ?? "",
            location: profile.location ?? "",
            summary: profile.summary ?? "",
          });
          setExperiences(profile.experiences ?? []);
          setEducation(profile.education ?? []);
          setSkills(profile.skills ?? []);
        }
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveBasic(event: FormEvent) {
    event.preventDefault();
    setSavingBasic(true);
    setError(null);

    const res = await fetch(API_BASE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basic),
    });

    setSavingBasic(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save profile.");
      return;
    }

    setStep(1);
  }

  if (loading) {
    return <p className="mt-8 text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
              i === step
                ? "bg-icon-purple-bg text-icon-purple-text font-medium"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                i === step ? "bg-icon-purple-text text-background" : "border border-border"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {label}
            {i < STEPS.length - 1 && <span className="text-border">→</span>}
          </button>
        ))}
      </div>

      {step === 0 && (
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Basic info</h2>
            <a href="/profile/import" className="text-sm text-accent hover:underline">
              Import from an existing resume (PDF/DOCX) →
            </a>
          </div>
          <form onSubmit={handleSaveBasic} className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm">
                Headline
                <input
                  type="text"
                  list="job-title-suggestions"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={basic.headline ?? ""}
                  onChange={(e) => setBasic({ ...basic, headline: e.target.value })}
                  className={inputClass}
                />
                <datalist id="job-title-suggestions">
                  {JOB_TITLE_SUGGESTIONS.map((title) => (
                    <option key={title} value={title} />
                  ))}
                </datalist>
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
                  placeholder="e.g. Bengaluru, India"
                  value={basic.location ?? ""}
                  onChange={(e) => setBasic({ ...basic, location: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm sm:col-span-3">
                Summary
                <textarea
                  rows={4}
                  value={basic.summary ?? ""}
                  onChange={(e) => setBasic({ ...basic, summary: e.target.value })}
                  className={inputClass}
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={savingBasic} className={buttonClass}>
                {savingBasic ? "Saving…" : "Save & Continue"}
              </button>
            </div>
          </form>
        </section>
      )}

      {step === 1 && (
        <>
          <ExperienceSection apiBase={API_BASE} experiences={experiences} setExperiences={setExperiences} setError={setError} />
          <StepNav onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </>
      )}

      {step === 2 && (
        <>
          <EducationSection apiBase={API_BASE} education={education} setEducation={setEducation} setError={setError} />
          <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </>
      )}

      {step === 3 && (
        <>
          <SkillsSection apiBase={API_BASE} skills={skills} setSkills={setSkills} setError={setError} />
          <StepNav onBack={() => setStep(2)} nextLabel="Done" onNext={() => setStep(0)} />
        </>
      )}
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel = "Continue",
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="flex justify-between">
      <button onClick={onBack} className={secondaryButtonClass}>
        ← Back
      </button>
      <button onClick={onNext} className={buttonClass}>
        {nextLabel}
      </button>
    </div>
  );
}
