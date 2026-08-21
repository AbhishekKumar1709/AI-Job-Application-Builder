import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = ["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: { resume: { select: { id: true, title: true } } },
    orderBy: [{ appliedAt: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const company = typeof body?.company === "string" ? body.company.trim() : "";
  const role = typeof body?.role === "string" ? body.role.trim() : "";
  const status = typeof body?.status === "string" && STATUSES.includes(body.status) ? body.status : "APPLIED";
  const jobUrl = typeof body?.jobUrl === "string" ? body.jobUrl.trim() || null : null;
  const notes = typeof body?.notes === "string" ? body.notes.trim() || null : null;
  const appliedAt = typeof body?.appliedAt === "string" && body.appliedAt ? new Date(body.appliedAt) : null;
  const resumeId = typeof body?.resumeId === "string" && body.resumeId ? body.resumeId : null;

  if (!company || !role) {
    return NextResponse.json({ error: "Company and role are required." }, { status: 400 });
  }

  if (appliedAt && Number.isNaN(appliedAt.getTime())) {
    return NextResponse.json({ error: "Applied date is invalid." }, { status: 400 });
  }

  if (resumeId) {
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId: session.user.id } });
    if (!resume) {
      return NextResponse.json({ error: "Selected resume not found." }, { status: 400 });
    }
  }

  const application = await prisma.application.create({
    data: { userId: session.user.id, company, role, status, jobUrl, notes, appliedAt, resumeId },
    include: { resume: { select: { id: true, title: true } } },
  });

  return NextResponse.json({ application }, { status: 201 });
}
