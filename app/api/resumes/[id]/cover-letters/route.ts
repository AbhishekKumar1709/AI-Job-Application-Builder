import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedResume } from "@/lib/resumeAccess";
import { formatResumeForPrompt } from "@/lib/resumeText";
import { askClaudeText } from "@/lib/ai";

const SYSTEM_PROMPT = `You write cover letters. Given a candidate's resume content and a job
description, write a concise, specific cover letter (3-4 short paragraphs) connecting the
candidate's actual experience to the role. Do not invent facts, employers, or skills that aren't
in the resume. Do not use generic filler like "I am writing to express my interest" — open with
something specific to the role or company. Respond with ONLY the letter text, no preamble, no
markdown, no subject line.`;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const resume = await prisma.resume.findFirst({ where: { id, userId: session.user.id } });
  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const coverLetters = await prisma.coverLetter.findMany({
    where: { resumeId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ coverLetters });
}

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
  const companyName = typeof body?.companyName === "string" ? body.companyName.trim() || null : null;

  if (!jobDescription) {
    return NextResponse.json({ error: "Job description is required." }, { status: 400 });
  }

  const resumeText = formatResumeForPrompt(resume);
  if (!resumeText.trim()) {
    return NextResponse.json({ error: "This resume has no content yet." }, { status: 400 });
  }

  const prompt = `Resume:\n${resumeText}\n\n${companyName ? `Company: ${companyName}\n\n` : ""}Job description:\n${jobDescription}`;

  try {
    const content = await askClaudeText(SYSTEM_PROMPT, prompt);
    const coverLetter = await prisma.coverLetter.create({
      data: { resumeId: id, jobDescription, companyName, content },
    });
    return NextResponse.json({ coverLetter }, { status: 201 });
  } catch (err) {
    console.error("Cover letter generation failed:", err);
    const message = err instanceof Error ? err.message : "Failed to generate cover letter.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
