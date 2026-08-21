import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnedResume } from "@/lib/resumeAccess";
import { formatResumeForPrompt } from "@/lib/resumeText";
import { askClaudeJSON } from "@/lib/ai";

type MatchResult = {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
};

const SYSTEM_PROMPT = `You compare a resume against a job description and assess fit. Identify
keywords/skills the job description asks for that the resume does and doesn't demonstrate, and
give a rough overall match score.

Respond with ONLY a JSON object (no other text) of this shape:
{ "matchScore": number (0-100), "matchedKeywords": string[], "missingKeywords": string[], "suggestions": string[] }
"suggestions" should be concrete ways to close the gap (at most 6 items).`;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const resume = await getOwnedResume(session.user.id, id);
  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const jobDescription = typeof body?.jobDescription === "string" ? body.jobDescription.trim() : "";
  if (!jobDescription) {
    return NextResponse.json({ error: "Job description is required." }, { status: 400 });
  }

  const resumeText = formatResumeForPrompt(resume);
  if (!resumeText.trim()) {
    return NextResponse.json({ error: "This resume has no content to match yet." }, { status: 400 });
  }

  const prompt = `Resume:\n${resumeText}\n\nJob description:\n${jobDescription}`;

  try {
    const result = await askClaudeJSON<MatchResult>(SYSTEM_PROMPT, prompt);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Job match failed:", err);
    const message = err instanceof Error ? err.message : "Failed to match against job description.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
