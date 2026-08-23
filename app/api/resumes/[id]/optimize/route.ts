import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnedResume } from "@/lib/resumeAccess";
import { formatResumeForPrompt } from "@/lib/resumeText";
import { askAIJSON } from "@/lib/ai";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

type Suggestion = { section: string; issue: string; suggestion: string };

const SYSTEM_PROMPT = `You are a resume-writing expert. Review the resume text you're given and
return concrete, actionable suggestions for improving it — stronger action verbs, quantifiable
results, clarity, and conciseness. Do not invent facts about the person's experience; only
suggest how to phrase what's already there better, or point out what's missing (e.g. "no
measurable outcomes in this role").

Respond with ONLY a JSON array (no other text), where each item is:
{ "section": string, "issue": string, "suggestion": string }
"section" should reference the specific entry (e.g. "Experience: Backend Engineer at Acme Corp").
Return at most 10 items. If the resume is already strong, return an empty array.`;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`ai:optimize:${session.user.id}`, 15, 3600);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const { id } = await params;
  const resume = await getOwnedResume(session.user.id, id);
  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const resumeText = formatResumeForPrompt(resume);
  if (!resumeText.trim()) {
    return NextResponse.json({ error: "This resume has no content to review yet." }, { status: 400 });
  }

  try {
    const suggestions = await askAIJSON<Suggestion[]>(SYSTEM_PROMPT, resumeText);
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("Resume optimization failed:", err);
    const message = err instanceof Error ? err.message : "Failed to generate suggestions.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
