import { Resend } from "resend";

function client() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
    console.log(`[dev] RESEND_API_KEY not set — password reset link for ${to}:\n${resetUrl}`);
    return;
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const { error } = await client().emails.send({
    from,
    to,
    subject: "Reset your password",
    html: `
      <p>Someone requested a password reset for this account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(error.message ?? "Failed to send email");
  }
}
