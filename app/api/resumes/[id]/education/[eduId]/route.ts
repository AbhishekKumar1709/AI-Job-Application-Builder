import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseEducationUpdate } from "@/lib/education";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; eduId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id, eduId } = await params;
  const existing = await prisma.resumeEducation.findFirst({
    where: { id: eduId, resumeId: id, resume: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Education entry not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseEducationUpdate(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const education = await prisma.resumeEducation.update({ where: { id: eduId }, data: parsed.data });
  return NextResponse.json({ education });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; eduId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id, eduId } = await params;
  const existing = await prisma.resumeEducation.findFirst({
    where: { id: eduId, resumeId: id, resume: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Education entry not found." }, { status: 404 });
  }

  await prisma.resumeEducation.delete({ where: { id: eduId } });
  return NextResponse.json({ ok: true });
}
