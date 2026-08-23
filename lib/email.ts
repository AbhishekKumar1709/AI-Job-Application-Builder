import { Resend } from "resend";

function client() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(apiKey);
}

async function sendEmail(to: string, subject: string, html: string, devLogLabel: string) {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
    console.log(`[dev] RESEND_API_KEY not set — ${devLogLabel} for ${to}:\n${html}`);
    return;
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const { error } = await client().emails.send({ from, to, subject, html });

  if (error) {
    throw new Error(error.message ?? "Failed to send email");
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    "Reset your password",
    `
      <p>Someone requested a password reset for this account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
    "password reset link",
  );
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  await sendEmail(
    to,
    "Verify your email",
    `
      <p>Confirm this is your email address to finish setting up your account.</p>
      <p><a href="${verifyUrl}">Click here to verify your email</a>. This link expires in 24 hours.</p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    `,
    "email verification link",
  );
}
