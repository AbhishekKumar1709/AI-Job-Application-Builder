import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/msg91";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const mobile = typeof body?.mobile === "string" ? body.mobile.trim() : "";
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

  if (!/^\d{10,15}$/.test(mobile) || !/^\d{4,8}$/.test(otp)) {
    return NextResponse.json({ error: "Missing or invalid mobile/otp." }, { status: 400 });
  }

  const verified = await verifyOtp(mobile, otp);

  if (!verified) {
    return NextResponse.json({ error: "Incorrect or expired OTP." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
