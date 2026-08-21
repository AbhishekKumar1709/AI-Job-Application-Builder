import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractResumeText, parseResumeText } from "@/lib/resumeParse";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 5MB)." }, { status: 400 });
  }

  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
    return NextResponse.json({ error: "Upload a .pdf or .docx file." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractResumeText(buffer, file.name);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Couldn't extract any text from that file. It may be a scanned image." },
        { status: 422 },
      );
    }

    const parsed = parseResumeText(text);
    return NextResponse.json({ parsed });
  } catch (err) {
    console.error("Resume parsing failed:", err);
    return NextResponse.json({ error: "Failed to parse that file." }, { status: 422 });
  }
}
