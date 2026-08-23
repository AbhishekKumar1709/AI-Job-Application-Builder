import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lengthError } from "@/lib/textLimits";

const MAX_CONTENT_LENGTH = 8000;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; letterId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id, letterId } = await params;
  const existing = await prisma.coverLetter.findFirst({
    where: { id: letterId, resumeId: id, resume: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Cover letter not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }
  const contentError = lengthError(content, MAX_CONTENT_LENGTH, "Content");
  if (contentError) {
    return NextResponse.json({ error: contentError }, { status: 400 });
  }

  const coverLetter = await prisma.coverLetter.update({
    where: { id: letterId },
    data: { content },
  });

  return NextResponse.json({ coverLetter });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; letterId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id, letterId } = await params;
  const existing = await prisma.coverLetter.findFirst({
    where: { id: letterId, resumeId: id, resume: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Cover letter not found." }, { status: 404 });
  }

  await prisma.coverLetter.delete({ where: { id: letterId } });
  return NextResponse.json({ ok: true });
}
