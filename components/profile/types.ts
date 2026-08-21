export type Experience = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
};

export type Education = {
  id: string;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
};

export type Skill = { id: string; name: string };

export const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
export const buttonClass =
  "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50";
export const secondaryButtonClass =
  "rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50";

export function toMonthInput(value: string | null): string {
  return value ? value.slice(0, 7) : "";
}

export function fromMonthInput(value: string): string | null {
  return value ? `${value}-01` : null;
}
