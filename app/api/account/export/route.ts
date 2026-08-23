import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const userId = session.user.id;

  const [user, profile, resumes, applications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, emailVerified: true, createdAt: true },
    }),
    prisma.profile.findUnique({
      where: { userId },
      include: { experiences: true, education: true, skills: true },
    }),
    prisma.resume.findMany({
      where: { userId },
      include: { experiences: true, education: true, skills: true, coverLetters: true },
    }),
    prisma.application.findMany({ where: { userId } }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user,
    profile,
    resumes,
    applications,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="account-data-${userId}.json"`,
    },
  });
}
