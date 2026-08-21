import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseExperienceUpdate } from "@/lib/experience";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; expId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id, expId } = await params;
  const existing = await prisma.resumeExperience.findFirst({
    where: { id: expId, resumeId: id, resume: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Experience entry not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseExperienceUpdate(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const experience = await prisma.resumeExperience.update({ where: { id: expId }, data: parsed.data });
  return NextResponse.json({ experience });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; expId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id, expId } = await params;
  const existing = await prisma.resumeExperience.findFirst({
    where: { id: expId, resumeId: id, resume: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Experience entry not found." }, { status: 404 });
  }

  await prisma.resumeExperience.delete({ where: { id: expId } });
  return NextResponse.json({ ok: true });
}
