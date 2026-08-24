import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { ResumeEditor } from "@/components/ResumeEditor";
import { ResumeAITools } from "@/components/ResumeAITools";
import { AppSidebar } from "@/components/AppSidebar";

export default async function ResumeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <AppSidebar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Edit resume</h1>

        <div className="mt-4 inline-flex rounded-lg border border-border p-1 text-sm">
          <span className="rounded-md bg-icon-purple-bg px-3 py-1.5 font-medium text-icon-purple-text">
            Edit
          </span>
          <Link href={`/resumes/${id}/preview`} className="rounded-md px-3 py-1.5 text-muted hover:text-foreground">
            Preview &amp; Export
          </Link>
        </div>

        <ResumeEditor resumeId={id} />
        <ResumeAITools resumeId={id} />
      </main>
    </div>
  );
}
