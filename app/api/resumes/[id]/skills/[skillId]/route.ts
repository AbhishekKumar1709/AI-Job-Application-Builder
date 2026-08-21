import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; skillId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id, skillId } = await params;
  const existing = await prisma.resumeSkill.findFirst({
    where: { id: skillId, resumeId: id, resume: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Skill not found." }, { status: 404 });
  }

  await prisma.resumeSkill.delete({ where: { id: skillId } });
  return NextResponse.json({ ok: true });
}
