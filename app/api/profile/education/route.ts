import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile } from "@/lib/profile";
import { parseEducationCreate } from "@/lib/education";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseEducationCreate(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const profile = await getOrCreateProfile(session.user.id);

  const education = await prisma.education.create({
    data: { profileId: profile.id, ...parsed.data },
  });

  return NextResponse.json({ education }, { status: 201 });
}
