import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const resume = await prisma.resume.findFirst({ where: { id, userId: session.user.id } });
  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Skill name is required." }, { status: 400 });
  }

  const existing = await prisma.resumeSkill.findUnique({
    where: { resumeId_name: { resumeId: id, name } },
  });
  if (existing) {
    return NextResponse.json({ error: "That skill is already on this resume." }, { status: 409 });
  }

  const skill = await prisma.resumeSkill.create({ data: { resumeId: id, name } });
  return NextResponse.json({ skill }, { status: 201 });
}
