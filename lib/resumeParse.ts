import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export type ParsedExperience = {
  title: string;
  company: string;
  dateRange: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string;
};

export type ParsedEducation = {
  institution: string;
  detail: string;
  dateRange: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type ParsedResume = {
  email: string | null;
  phone: string | null;
  summary: string | null;
  skills: string[];
  experiences: ParsedExperience[];
  education: ParsedEducation[];
};

const SECTION_HEADERS: Record<string, "summary" | "experience" | "education" | "skills"> = {
  summary: "summary",
  "professional summary": "summary",
  objective: "summary",
  profile: "summary",
  experience: "experience",
  "work experience": "experience",
  "employment history": "experience",
  "professional experience": "experience",
  education: "education",
  "education and training": "education",
  skills: "skills",
  "technical skills": "skills",
  "skills and interests": "skills",
};

export async function extractResumeText(buffer: Buffer, filename: string): Promise<string> {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      // pdf-parse inserts "-- N of M --" page separators into the text;
      // strip them so they don't get picked up as resume content.
      return result.text.replace(/^--\s*\d+\s*of\s*\d+\s*--$/gim, "");
    } finally {
      await parser.destroy();
    }
  }

  if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Upload a .pdf or .docx file.");
}

function detectSection(line: string): "summary" | "experience" | "education" | "skills" | null {
  const normalized = line.trim().toLowerCase().replace(/[:\-–]+$/, "");
  return SECTION_HEADERS[normalized] ?? null;
}

const DATE_RANGE_RE = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(19|20)\d{2}\s*(?:[-–—to]+)\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?((19|20)\d{2}|present|current)/i;

function extractDateRange(text: string): string | null {
  const match = text.match(DATE_RANGE_RE);
  return match ? match[0].trim() : null;
}

function guessDates(dateRange: string | null): { startDate: string | null; endDate: string | null; current: boolean } {
  if (!dateRange) return { startDate: null, endDate: null, current: false };
  const years = dateRange.match(/(19|20)\d{2}/g) ?? [];
  const current = /present|current/i.test(dateRange);
  const startDate = years[0] ? `${years[0]}-01` : null;
  const endDate = !current && years[1] ? `${years[1]}-01` : null;
  return { startDate, endDate, current };
}

// Splits a section's (already blank-line-free) lines into per-entry
// blocks, anchored on date-range lines: each entry is assumed to be
// [up to headerLines of title/institution info] [date line]
// [description lines...], repeating. Neither PDF nor DOCX text
// extraction reliably preserves blank lines between entries (PDF usually
// drops them, DOCX inserts one after every paragraph), so blank lines
// aren't used as a signal here — headerLines is tuned per section
// instead (job entries are typically "title - company" on one line;
// education entries typically split institution and degree across two).
function splitIntoBlocks(lines: string[], headerLines: number): string[][] {
  const dateIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (DATE_RANGE_RE.test(lines[i])) dateIndices.push(i);
  }

  if (dateIndices.length === 0) {
    return lines.length > 0 ? [lines] : [];
  }

  const blocks: string[][] = [];
  let boundary = 0;

  for (let k = 0; k < dateIndices.length; k++) {
    const headerStart = Math.max(boundary, dateIndices[k] - headerLines);
    const nextDate = dateIndices[k + 1];
    const blockEnd = nextDate !== undefined ? Math.max(headerStart + 1, nextDate - headerLines) : lines.length;
    blocks.push(lines.slice(headerStart, blockEnd));
    boundary = blockEnd;
  }

  return blocks;
}

function parseExperienceBlock(block: string[]): ParsedExperience {
  const header = block[0];
  const dateRange = extractDateRange(block.slice(0, 2).join(" "));
  const separator = /\s+(?:at|@|-|,|\|)\s+/i;
  const parts = header.split(separator);

  const title = parts[0]?.trim() || header.trim();
  const company = parts.length > 1 ? parts.slice(1).join(" ").trim() : "";
  const description = block
    .slice(1)
    .filter((line) => extractDateRange(line) === null)
    .join(" ")
    .trim();

  return { title, company, dateRange, ...guessDates(dateRange), description };
}

function parseEducationBlock(block: string[]): ParsedEducation {
  const header = block[0];
  const dateRange = extractDateRange(block.join(" "));
  const detail = block
    .slice(1)
    .filter((line) => extractDateRange(line) === null)
    .join(", ")
    .trim();
  const { startDate, endDate } = guessDates(dateRange);

  return { institution: header.trim(), detail, dateRange, startDate, endDate };
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;

export function parseResumeText(text: string): ParsedResume {
  const lines = text.split(/\r?\n/).map((l) => l.trim());

  const emailMatch = text.match(EMAIL_RE);
  const phoneMatch = text.match(PHONE_RE);

  const sections: Record<"summary" | "experience" | "education" | "skills", string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
  };

  let currentSection: keyof typeof sections | null = null;
  for (const line of lines) {
    const detected = detectSection(line);
    if (detected) {
      currentSection = detected;
      continue;
    }
    if (currentSection && line !== "") {
      sections[currentSection].push(line);
    }
  }

  const skills = sections.skills
    .join(", ")
    .split(/[,;|•]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 40)
    .slice(0, 30);

  const experiences = splitIntoBlocks(sections.experience, 1)
    .map(parseExperienceBlock)
    .filter((e) => e.title.length > 0)
    .slice(0, 15);

  const education = splitIntoBlocks(sections.education, 2)
    .map(parseEducationBlock)
    .filter((e) => e.institution.length > 0)
    .slice(0, 10);

  const summary = sections.summary.join(" ").trim() || null;

  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    summary,
    skills,
    experiences,
    education,
  };
}
