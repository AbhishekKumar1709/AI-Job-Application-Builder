import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/msg91";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const mobile = typeof body?.mobile === "string" ? body.mobile.trim() : "";

  if (!/^\d{10,15}$/.test(mobile)) {
    return NextResponse.json(
      { error: "Enter a valid mobile number with country code, digits only (e.g. 91XXXXXXXXXX)." },
      { status: 400 },
    );
  }

  try {
    await sendOtp(mobile);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
