"use client";

import { useEffect, useRef, useState } from "react";
import { ExperienceForm, type ExperienceFormState } from "./profile/ExperienceForm";
import { EducationForm, type EducationFormState } from "./profile/EducationForm";
import { buttonClass, secondaryButtonClass } from "./profile/types";

type ParsedExperience = {
  title: string;
  company: string;
  dateRange: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string;
};

type ParsedEducation = {
  institution: string;
  detail: string;
  dateRange: string | null;
  startDate: string | null;
  endDate: string | null;
};

type Parsed = {
  email: string | null;
  phone: string | null;
  summary: string | null;
  skills: string[];
  experiences: ParsedExperience[];
  education: ParsedEducation[];
};

type ProfileBasics = { headline: string | null; phone: string | null; location: string | null; summary: string | null };

function toExperienceForm(exp: ParsedExperience): ExperienceFormState {
  return {
    company: exp.company,
    title: exp.title,
    location: "",
    startDate: exp.startDate ?? "",
    endDate: exp.endDate ?? "",
    current: exp.current,
    description: exp.description,
  };
}

function toEducationForm(edu: ParsedEducation): EducationFormState {
  return {
    institution: edu.institution,
    degree: edu.detail,
    fieldOfStudy: "",
    startDate: edu.startDate ?? "",
    endDate: edu.endDate ?? "",
    description: "",
  };
}

export function ResumeImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [profile, setProfile] = useState<ProfileBasics | null>(null);

  const [expForms, setExpForms] = useState<ExperienceFormState[]>([]);
  const [expAdded, setExpAdded] = useState<boolean[]>([]);
  const [eduForms, setEduForms] = useState<EducationFormState[]>([]);
  const [eduAdded, setEduAdded] = useState<boolean[]>([]);
  const [skillAdded, setSkillAdded] = useState<boolean[]>([]);
  const [phoneApplied, setPhoneApplied] = useState(false);
  const [summaryApplied, setSummaryApplied] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile({
            headline: data.profile.headline,
            phone: data.profile.phone,
            location: data.profile.location,
            summary: data.profile.summary,
          });
        } else {
          setProfile({ headline: null, phone: null, location: null, summary: null });
        }
      })
      .catch(() => setProfile({ headline: null, phone: null, location: null, summary: null }));
  }, []);

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a .pdf or .docx file first.");
      return;
    }

    setParsing(true);
    setError(null);
    setParsed(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/parse-resume", { method: "POST", body: formData });
    setParsing(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to parse resume.");
      return;
    }

    const data = await res.json();
    const p: Parsed = data.parsed;
    setParsed(p);
    setExpForms(p.experiences.map(toExperienceForm));
    setExpAdded(p.experiences.map(() => false));
    setEduForms(p.education.map(toEducationForm));
    setEduAdded(p.education.map(() => false));
    setSkillAdded(p.skills.map(() => false));
    setPhoneApplied(false);
    setSummaryApplied(false);
  }

  async function applyPhone() {
    if (!parsed?.phone || !profile) return;
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, phone: parsed.phone }),
    });
    if (res.ok) {
      setProfile({ ...profile, phone: parsed.phone });
      setPhoneApplied(true);
    } else {
      setError("Failed to update phone.");
    }
  }

  async function applySummary() {
    if (!parsed?.summary || !profile) return;
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, summary: parsed.summary }),
    });
    if (res.ok) {
      setProfile({ ...profile, summary: parsed.summary });
      setSummaryApplied(true);
    } else {
      setError("Failed to update summary.");
    }
  }

  async function addExperience(index: number) {
    const form = expForms[index];
    const res = await fetch("/api/profile/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        startDate: form.startDate ? `${form.startDate}-01` : null,
        endDate: form.current ? null : form.endDate ? `${form.endDate}-01` : null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add experience.");
      return;
    }
    setExpAdded((prev) => prev.map((v, i) => (i === index ? true : v)));
  }

  async function addEducation(index: number) {
    const form = eduForms[index];
    const res = await fetch("/api/profile/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        startDate: form.startDate ? `${form.startDate}-01` : null,
        endDate: form.endDate ? `${form.endDate}-01` : null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add education.");
      return;
    }
    setEduAdded((prev) => prev.map((v, i) => (i === index ? true : v)));
  }

  async function addSkill(index: number) {
    const name = parsed?.skills[index];
    if (!name) return;
    const res = await fetch("/api/profile/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add skill.");
      return;
    }
    setSkillAdded((prev) => prev.map((v, i) => (i === index ? true : v)));
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="text-sm" />
        <button onClick={handleUpload} disabled={parsing} className={buttonClass}>
          {parsing ? "Parsing…" : "Parse resume"}
        </button>
      </div>

      {parsed && (
        <>
          <p className="text-sm text-muted">
            Best-effort extraction — review and edit everything below before
            adding it to your profile. Nothing is saved automatically.
          </p>

          {(parsed.phone || parsed.summary) && (
            <section>
              <h2 className="text-lg font-semibold">Contact &amp; summary</h2>
              <div className="mt-3 flex flex-col gap-3">
                {parsed.phone && (
                  <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <span>Detected phone: {parsed.phone}</span>
                    <button onClick={applyPhone} disabled={phoneApplied} className={secondaryButtonClass}>
                      {phoneApplied ? "Applied ✓" : "Apply to profile"}
                    </button>
                  </div>
                )}
                {parsed.summary && (
                  <div className="rounded-lg border border-border p-3 text-sm">
                    <p className="text-muted">Detected summary:</p>
                    <p className="mt-1">{parsed.summary}</p>
                    <button onClick={applySummary} disabled={summaryApplied} className={`${secondaryButtonClass} mt-2`}>
                      {summaryApplied ? "Applied ✓" : "Apply to profile"}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {expForms.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">Experience found ({expForms.length})</h2>
              <div className="mt-3 flex flex-col gap-4">
                {expForms.map((form, i) =>
                  expAdded[i] ? (
                    <p key={i} className="text-sm text-green-600">
                      Added: {form.title} · {form.company}
                    </p>
                  ) : (
                    <ExperienceForm
                      key={i}
                      form={form}
                      setForm={(v) => setExpForms((prev) => prev.map((f, idx) => (idx === i ? v : f)))}
                      onSubmit={(e) => {
                        e.preventDefault();
                        addExperience(i);
                      }}
                      onCancel={() => setExpAdded((prev) => prev.map((v, idx) => (idx === i ? true : v)))}
                      saving={false}
                    />
                  ),
                )}
              </div>
            </section>
          )}

          {eduForms.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">Education found ({eduForms.length})</h2>
              <div className="mt-3 flex flex-col gap-4">
                {eduForms.map((form, i) =>
                  eduAdded[i] ? (
                    <p key={i} className="text-sm text-green-600">
                      Added: {form.institution}
                    </p>
                  ) : (
                    <EducationForm
                      key={i}
                      form={form}
                      setForm={(v) => setEduForms((prev) => prev.map((f, idx) => (idx === i ? v : f)))}
                      onSubmit={(e) => {
                        e.preventDefault();
                        addEducation(i);
                      }}
                      onCancel={() => setEduAdded((prev) => prev.map((v, idx) => (idx === i ? true : v)))}
                      saving={false}
                    />
                  ),
                )}
              </div>
            </section>
          )}

          {parsed.skills.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">Skills found ({parsed.skills.length})</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {parsed.skills.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => addSkill(i)}
                    disabled={skillAdded[i]}
                    className={secondaryButtonClass}
                  >
                    {skillAdded[i] ? `${skill} ✓` : `+ ${skill}`}
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
