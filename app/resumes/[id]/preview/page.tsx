import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { ResumePreview } from "@/components/ResumePreview";
import { AppSidebar } from "@/components/AppSidebar";

export default async function ResumePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <div className="no-print contents">
        <AppSidebar />
      </div>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:py-12">
        <div className="no-print">
          <h1 className="text-2xl font-semibold tracking-tight">Edit resume</h1>
          <div className="mt-4 inline-flex rounded-lg border border-border p-1 text-sm">
            <Link href={`/resumes/${id}`} className="rounded-md px-3 py-1.5 text-muted hover:text-foreground">
              Edit
            </Link>
            <span className="rounded-md bg-icon-purple-bg px-3 py-1.5 font-medium text-icon-purple-text">
              Preview &amp; Export
            </span>
          </div>
        </div>

        <ResumePreview resumeId={id} userName={session.user.name ?? null} userEmail={session.user.email ?? null} />
      </main>
    </div>
  );
}
