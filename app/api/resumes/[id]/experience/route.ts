import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseExperienceCreate } from "@/lib/experience";

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
  const parsed = parseExperienceCreate(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const sortOrder = await prisma.resumeExperience.count({ where: { resumeId: id } });

  const experience = await prisma.resumeExperience.create({
    data: { resumeId: id, sortOrder, ...parsed.data },
  });

  return NextResponse.json({ experience }, { status: 201 });
}
