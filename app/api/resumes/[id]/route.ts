import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedResume } from "@/lib/resumeAccess";
import { SHORT_TEXT_MAX, LONG_TEXT_MAX, lengthError } from "@/lib/textLimits";

const TEMPLATES = ["classic", "compact"];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const resume = await getOwnedResume(session.user.id, id);

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  return NextResponse.json({ resume });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.resume.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (typeof body?.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    data.title = title;
  }
  if (typeof body?.headline === "string") data.headline = body.headline.trim() || null;
  if (typeof body?.phone === "string") data.phone = body.phone.trim() || null;
  if (typeof body?.location === "string") data.location = body.location.trim() || null;
  if (typeof body?.summary === "string") data.summary = body.summary.trim() || null;
  if (typeof body?.template === "string") {
    if (!TEMPLATES.includes(body.template)) {
      return NextResponse.json({ error: "Invalid template." }, { status: 400 });
    }
    data.template = body.template;
  }

  const error =
    (typeof data.title === "string" && lengthError(data.title, SHORT_TEXT_MAX, "Title")) ||
    (typeof data.headline === "string" && lengthError(data.headline, SHORT_TEXT_MAX, "Headline")) ||
    (typeof data.phone === "string" && lengthError(data.phone, SHORT_TEXT_MAX, "Phone")) ||
    (typeof data.location === "string" && lengthError(data.location, SHORT_TEXT_MAX, "Location")) ||
    (typeof data.summary === "string" && lengthError(data.summary, LONG_TEXT_MAX, "Summary"));
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const resume = await prisma.resume.update({ where: { id }, data });
  return NextResponse.json({ resume });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.resume.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  await prisma.resume.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
