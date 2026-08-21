import { SHORT_TEXT_MAX, LONG_TEXT_MAX, lengthError } from "@/lib/textLimits";

export type ExperienceInput = {
  company: string;
  title: string;
  location: string | null;
  description: string | null;
  current: boolean;
  startDate: Date;
  endDate: Date | null;
};

export function parseExperienceCreate(body: unknown): { data: ExperienceInput } | { error: string } {
  const b = body as Record<string, unknown> | null;
  const company = typeof b?.company === "string" ? b.company.trim() : "";
  const title = typeof b?.title === "string" ? b.title.trim() : "";
  const location = typeof b?.location === "string" ? b.location.trim() || null : null;
  const description = typeof b?.description === "string" ? b.description.trim() || null : null;
  const current = b?.current === true;
  const startDate = typeof b?.startDate === "string" ? new Date(b.startDate) : null;
  const endDate = !current && typeof b?.endDate === "string" && b.endDate ? new Date(b.endDate) : null;

  if (!company || !title) {
    return { error: "Company and title are required." };
  }
  if (!startDate || Number.isNaN(startDate.getTime())) {
    return { error: "A valid start date is required." };
  }
  if (endDate && Number.isNaN(endDate.getTime())) {
    return { error: "End date is invalid." };
  }

  const error =
    lengthError(company, SHORT_TEXT_MAX, "Company") ||
    lengthError(title, SHORT_TEXT_MAX, "Title") ||
    (location && lengthError(location, SHORT_TEXT_MAX, "Location")) ||
    (description && lengthError(description, LONG_TEXT_MAX, "Description"));
  if (error) {
    return { error };
  }

  return { data: { company, title, location, description, current, startDate, endDate } };
}

export function parseExperienceUpdate(body: unknown): { data: Record<string, unknown> } | { error: string } {
  const b = (body as Record<string, unknown>) ?? {};
  const data: Record<string, unknown> = {};

  if (typeof b.company === "string") data.company = b.company.trim();
  if (typeof b.title === "string") data.title = b.title.trim();
  if (typeof b.location === "string") data.location = b.location.trim() || null;
  if (typeof b.description === "string") data.description = b.description.trim() || null;
  if (typeof b.current === "boolean") data.current = b.current;

  if (typeof b.startDate === "string") {
    const startDate = new Date(b.startDate);
    if (Number.isNaN(startDate.getTime())) {
      return { error: "Start date is invalid." };
    }
    data.startDate = startDate;
  }

  if ("endDate" in b) {
    if (b.current === true || b.endDate === null || b.endDate === "") {
      data.endDate = null;
    } else if (typeof b.endDate === "string") {
      const endDate = new Date(b.endDate);
      if (Number.isNaN(endDate.getTime())) {
        return { error: "End date is invalid." };
      }
      data.endDate = endDate;
    }
  }

  if (data.company === "" || data.title === "") {
    return { error: "Company and title are required." };
  }

  const error =
    (typeof data.company === "string" && lengthError(data.company, SHORT_TEXT_MAX, "Company")) ||
    (typeof data.title === "string" && lengthError(data.title, SHORT_TEXT_MAX, "Title")) ||
    (typeof data.location === "string" && lengthError(data.location, SHORT_TEXT_MAX, "Location")) ||
    (typeof data.description === "string" && lengthError(data.description, LONG_TEXT_MAX, "Description"));
  if (error) {
    return { error };
  }

  return { data };
}
