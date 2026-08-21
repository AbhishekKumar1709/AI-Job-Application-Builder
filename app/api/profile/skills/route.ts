import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile } from "@/lib/profile";
import { SHORT_TEXT_MAX, lengthError } from "@/lib/textLimits";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Skill name is required." }, { status: 400 });
  }
  const nameError = lengthError(name, SHORT_TEXT_MAX, "Skill name");
  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  const profile = await getOrCreateProfile(session.user.id);

  const existing = await prisma.skill.findUnique({
    where: { profileId_name: { profileId: profile.id, name } },
  });
  if (existing) {
    return NextResponse.json({ error: "That skill is already on your profile." }, { status: 409 });
  }

  const skill = await prisma.skill.create({ data: { profileId: profile.id, name } });
  return NextResponse.json({ skill }, { status: 201 });
}
