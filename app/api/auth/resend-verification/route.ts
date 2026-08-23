import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueVerificationEmail } from "@/lib/emailVerification";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`auth:resend-verification:${session.user.id}`, 3, 3600);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ message: "Email already verified." });
  }

  try {
    await issueVerificationEmail(user.id, user.email);
  } catch (err) {
    console.error("Failed to resend verification email:", err);
    return NextResponse.json({ error: "Failed to send verification email." }, { status: 502 });
  }

  return NextResponse.json({ message: "Verification email sent." });
}
