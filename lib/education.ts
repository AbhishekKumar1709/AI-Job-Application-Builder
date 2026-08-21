import { SHORT_TEXT_MAX, LONG_TEXT_MAX, lengthError } from "@/lib/textLimits";

export type EducationInput = {
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
};

export function parseEducationCreate(body: unknown): { data: EducationInput } | { error: string } {
  const b = body as Record<string, unknown> | null;
  const institution = typeof b?.institution === "string" ? b.institution.trim() : "";
  const degree = typeof b?.degree === "string" ? b.degree.trim() || null : null;
  const fieldOfStudy = typeof b?.fieldOfStudy === "string" ? b.fieldOfStudy.trim() || null : null;
  const description = typeof b?.description === "string" ? b.description.trim() || null : null;
  const startDate = typeof b?.startDate === "string" && b.startDate ? new Date(b.startDate) : null;
  const endDate = typeof b?.endDate === "string" && b.endDate ? new Date(b.endDate) : null;

  if (!institution) {
    return { error: "Institution is required." };
  }
  if (startDate && Number.isNaN(startDate.getTime())) {
    return { error: "Start date is invalid." };
  }
  if (endDate && Number.isNaN(endDate.getTime())) {
    return { error: "End date is invalid." };
  }

  const error =
    lengthError(institution, SHORT_TEXT_MAX, "Institution") ||
    (degree && lengthError(degree, SHORT_TEXT_MAX, "Degree")) ||
    (fieldOfStudy && lengthError(fieldOfStudy, SHORT_TEXT_MAX, "Field of study")) ||
    (description && lengthError(description, LONG_TEXT_MAX, "Description"));
  if (error) {
    return { error };
  }

  return { data: { institution, degree, fieldOfStudy, description, startDate, endDate } };
}

export function parseEducationUpdate(body: unknown): { data: Record<string, unknown> } | { error: string } {
  const b = (body as Record<string, unknown>) ?? {};
  const data: Record<string, unknown> = {};

  if (typeof b.institution === "string") data.institution = b.institution.trim();
  if (typeof b.degree === "string") data.degree = b.degree.trim() || null;
  if (typeof b.fieldOfStudy === "string") data.fieldOfStudy = b.fieldOfStudy.trim() || null;
  if (typeof b.description === "string") data.description = b.description.trim() || null;

  if ("startDate" in b) {
    if (b.startDate === null || b.startDate === "") {
      data.startDate = null;
    } else if (typeof b.startDate === "string") {
      const startDate = new Date(b.startDate);
      if (Number.isNaN(startDate.getTime())) {
        return { error: "Start date is invalid." };
      }
      data.startDate = startDate;
    }
  }

  if ("endDate" in b) {
    if (b.endDate === null || b.endDate === "") {
      data.endDate = null;
    } else if (typeof b.endDate === "string") {
      const endDate = new Date(b.endDate);
      if (Number.isNaN(endDate.getTime())) {
        return { error: "End date is invalid." };
      }
      data.endDate = endDate;
    }
  }

  if (data.institution === "") {
    return { error: "Institution is required." };
  }

  const error =
    (typeof data.institution === "string" && lengthError(data.institution, SHORT_TEXT_MAX, "Institution")) ||
    (typeof data.degree === "string" && lengthError(data.degree, SHORT_TEXT_MAX, "Degree")) ||
    (typeof data.fieldOfStudy === "string" && lengthError(data.fieldOfStudy, SHORT_TEXT_MAX, "Field of study")) ||
    (typeof data.description === "string" && lengthError(data.description, LONG_TEXT_MAX, "Description"));
  if (error) {
    return { error };
  }

  return { data };
}
