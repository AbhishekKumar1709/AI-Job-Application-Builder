import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { experiences: true, education: true, skills: true },
  });

  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      title,
      headline: profile?.headline ?? null,
      phone: profile?.phone ?? null,
      location: profile?.location ?? null,
      summary: profile?.summary ?? null,
      experiences: profile
        ? {
            create: profile.experiences.map((e) => ({
              company: e.company,
              title: e.title,
              location: e.location,
              description: e.description,
              current: e.current,
              startDate: e.startDate,
              endDate: e.endDate,
            })),
          }
        : undefined,
      education: profile
        ? {
            create: profile.education.map((e) => ({
              institution: e.institution,
              degree: e.degree,
              fieldOfStudy: e.fieldOfStudy,
              description: e.description,
              startDate: e.startDate,
              endDate: e.endDate,
            })),
          }
        : undefined,
      skills: profile
        ? {
            create: profile.skills.map((s) => ({ name: s.name })),
          }
        : undefined,
    },
    include: {
      experiences: { orderBy: { startDate: "desc" } },
      education: { orderBy: { startDate: "desc" } },
      skills: { orderBy: { name: "asc" } },
    },
  });

  return NextResponse.json({ resume }, { status: 201 });
}
