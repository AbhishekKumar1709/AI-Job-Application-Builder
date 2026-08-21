import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile } from "@/lib/profile";
import { SHORT_TEXT_MAX, LONG_TEXT_MAX, lengthError } from "@/lib/textLimits";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      experiences: { orderBy: { startDate: "desc" } },
      education: { orderBy: { startDate: "desc" } },
      skills: { orderBy: { name: "asc" } },
    },
  });

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const headline = typeof body?.headline === "string" ? body.headline.trim() || null : null;
  const phone = typeof body?.phone === "string" ? body.phone.trim() || null : null;
  const location = typeof body?.location === "string" ? body.location.trim() || null : null;
  const summary = typeof body?.summary === "string" ? body.summary.trim() || null : null;

  const error =
    (headline && lengthError(headline, SHORT_TEXT_MAX, "Headline")) ||
    (phone && lengthError(phone, SHORT_TEXT_MAX, "Phone")) ||
    (location && lengthError(location, SHORT_TEXT_MAX, "Location")) ||
    (summary && lengthError(summary, LONG_TEXT_MAX, "Summary"));
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  await getOrCreateProfile(session.user.id);

  const profile = await prisma.profile.update({
    where: { userId: session.user.id },
    data: { headline, phone, location, summary },
  });

  return NextResponse.json({ profile });
}
