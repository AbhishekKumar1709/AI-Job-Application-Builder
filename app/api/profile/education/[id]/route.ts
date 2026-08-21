import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseEducationUpdate } from "@/lib/education";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.education.findFirst({
    where: { id, profile: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Education entry not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseEducationUpdate(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const education = await prisma.education.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ education });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.education.findFirst({
    where: { id, profile: { userId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Education entry not found." }, { status: 404 });
  }

  await prisma.education.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
