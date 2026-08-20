const MSG91_BASE_URL = "https://control.msg91.com/api/v5/otp";

function authHeaders() {
  const authkey = process.env.MSG91_AUTH_KEY;
  if (!authkey) {
    throw new Error("MSG91_AUTH_KEY is not set");
  }
  return { authkey, "Content-Type": "application/json" };
}

export async function sendOtp(mobile: string) {
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("MSG91_TEMPLATE_ID is not set");
  }

  const url = `${MSG91_BASE_URL}?template_id=${encodeURIComponent(templateId)}&mobile=${encodeURIComponent(mobile)}`;
  const res = await fetch(url, { method: "POST", headers: authHeaders() });
  const data = await res.json();

  if (data.type !== "success") {
    throw new Error(data.message ?? "Failed to send OTP");
  }

  return data;
}

export async function verifyOtp(mobile: string, otp: string) {
  const url = `${MSG91_BASE_URL}/verify?otp=${encodeURIComponent(otp)}&mobile=${encodeURIComponent(mobile)}`;
  const res = await fetch(url, { method: "GET", headers: authHeaders() });
  const data = await res.json();

  return data.type === "success";
}
