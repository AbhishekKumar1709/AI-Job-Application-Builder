import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { ResumeImport } from "@/components/ResumeImport";
import { AppSidebar } from "@/components/AppSidebar";

export default async function ImportResumePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <AppSidebar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 sm:py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Import from resume</h1>
          <Link href="/profile" className="text-sm text-accent hover:underline">
            Back to profile
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">
          Upload an existing resume (PDF or DOCX) to pre-fill your profile.
          Extraction is best-effort — review everything before it&apos;s
          added.
        </p>

        <ResumeImport />
      </main>
    </div>
  );
}
