type ResumeForPrompt = {
  headline: string | null;
  summary: string | null;
  experiences: {
    title: string;
    company: string;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    current: boolean;
    description: string | null;
  }[];
  education: {
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    startDate: Date | null;
    endDate: Date | null;
  }[];
  skills: { name: string }[];
};

function fmtDate(d: Date | null): string {
  return d ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}` : "";
}

export function formatResumeForPrompt(resume: ResumeForPrompt): string {
  const parts: string[] = [];

  if (resume.headline) parts.push(`Headline: ${resume.headline}`);
  if (resume.summary) parts.push(`Summary: ${resume.summary}`);

  if (resume.experiences.length > 0) {
    parts.push("\nExperience:");
    for (const e of resume.experiences) {
      const range = `${fmtDate(e.startDate)} - ${e.current ? "Present" : fmtDate(e.endDate)}`;
      parts.push(`- ${e.title} at ${e.company}${e.location ? `, ${e.location}` : ""} (${range})`);
      if (e.description) parts.push(`  ${e.description}`);
    }
  }

  if (resume.education.length > 0) {
    parts.push("\nEducation:");
    for (const ed of resume.education) {
      const range = `${fmtDate(ed.startDate)} - ${fmtDate(ed.endDate)}`;
      parts.push(`- ${ed.institution}${ed.degree ? `, ${ed.degree}` : ""}${ed.fieldOfStudy ? ` in ${ed.fieldOfStudy}` : ""} (${range})`);
    }
  }

  if (resume.skills.length > 0) {
    parts.push(`\nSkills: ${resume.skills.map((s) => s.name).join(", ")}`);
  }

  return parts.join("\n");
}
