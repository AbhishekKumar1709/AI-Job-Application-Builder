import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
