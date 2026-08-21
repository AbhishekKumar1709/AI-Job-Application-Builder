import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.skill.findFirst({
    where: { id, profile: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Skill not found." }, { status: 404 });
  }

  await prisma.skill.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
