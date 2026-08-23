import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile } from "@/lib/profile";
import { parseExperienceCreate } from "@/lib/experience";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseExperienceCreate(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const profile = await getOrCreateProfile(session.user.id);
  const sortOrder = await prisma.experience.count({ where: { profileId: profile.id } });

  const experience = await prisma.experience.create({
    data: { profileId: profile.id, sortOrder, ...parsed.data },
  });

  return NextResponse.json({ experience }, { status: 201 });
}
