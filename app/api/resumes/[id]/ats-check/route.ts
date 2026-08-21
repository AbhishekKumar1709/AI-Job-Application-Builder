import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnedResume } from "@/lib/resumeAccess";
import { formatResumeForPrompt } from "@/lib/resumeText";
import { askClaudeJSON } from "@/lib/ai";

type AtsResult = { score: number; issues: string[]; strengths: string[] };

const SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) compatibility checker. Given a
resume's text content, evaluate how well it would parse and rank in a typical ATS: clear section
structure, standard job titles, consistent dates, quantifiable achievements, and no missing
information like dates or company names.

Respond with ONLY a JSON object (no other text) of this shape:
{ "score": number (0-100), "issues": string[], "strengths": string[] }
"issues" should be specific and actionable. "strengths" can be empty if there are none. Keep each
issue and strength to one sentence.`;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const resume = await getOwnedResume(session.user.id, id);
  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const resumeText = formatResumeForPrompt(resume);
  if (!resumeText.trim()) {
    return NextResponse.json({ error: "This resume has no content to check yet." }, { status: 400 });
  }

  try {
    const result = await askClaudeJSON<AtsResult>(SYSTEM_PROMPT, resumeText);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("ATS check failed:", err);
    const message = err instanceof Error ? err.message : "Failed to run ATS check.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
