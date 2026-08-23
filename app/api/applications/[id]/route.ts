import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHORT_TEXT_MAX, LONG_TEXT_MAX, lengthError } from "@/lib/textLimits";

const STATUSES = ["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.application.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (typeof body?.company === "string") data.company = body.company.trim();
  if (typeof body?.role === "string") data.role = body.role.trim();
  if (typeof body?.jobUrl === "string") data.jobUrl = body.jobUrl.trim() || null;
  if (typeof body?.notes === "string") data.notes = body.notes.trim() || null;

  if (typeof body?.status === "string") {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = body.status;
  }

  if ("appliedAt" in (body ?? {})) {
    if (body.appliedAt === null || body.appliedAt === "") {
      data.appliedAt = null;
    } else if (typeof body.appliedAt === "string") {
      const appliedAt = new Date(body.appliedAt);
      if (Number.isNaN(appliedAt.getTime())) {
        return NextResponse.json({ error: "Applied date is invalid." }, { status: 400 });
      }
      data.appliedAt = appliedAt;
    }
  }

  if ("resumeId" in (body ?? {})) {
    if (body.resumeId === null || body.resumeId === "") {
      data.resumeId = null;
    } else if (typeof body.resumeId === "string") {
      const resume = await prisma.resume.findFirst({ where: { id: body.resumeId, userId: session.user.id } });
      if (!resume) {
        return NextResponse.json({ error: "Selected resume not found." }, { status: 400 });
      }
      data.resumeId = body.resumeId;
    }
  }

  if ("coverLetterId" in (body ?? {})) {
    if (body.coverLetterId === null || body.coverLetterId === "") {
      data.coverLetterId = null;
    } else if (typeof body.coverLetterId === "string") {
      const coverLetter = await prisma.coverLetter.findFirst({
        where: { id: body.coverLetterId, resume: { userId: session.user.id } },
      });
      if (!coverLetter) {
        return NextResponse.json({ error: "Selected cover letter not found." }, { status: 400 });
      }
      data.coverLetterId = body.coverLetterId;
    }
  }

  if (data.company === "" || data.role === "") {
    return NextResponse.json({ error: "Company and role are required." }, { status: 400 });
  }

  const lengthErr =
    (typeof data.company === "string" && lengthError(data.company, SHORT_TEXT_MAX, "Company")) ||
    (typeof data.role === "string" && lengthError(data.role, SHORT_TEXT_MAX, "Role")) ||
    (typeof data.jobUrl === "string" && lengthError(data.jobUrl, SHORT_TEXT_MAX, "Job URL")) ||
    (typeof data.notes === "string" && lengthError(data.notes, LONG_TEXT_MAX, "Notes"));
  if (lengthErr) {
    return NextResponse.json({ error: lengthErr }, { status: 400 });
  }

  const application = await prisma.application.update({
    where: { id },
    data,
    include: { resume: { select: { id: true, title: true } } },
  });

  return NextResponse.json({ application });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.application.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
