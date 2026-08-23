import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { ResumePreview } from "@/components/ResumePreview";
import { AppHeader } from "@/components/AppHeader";

export default async function ResumePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="no-print">
        <AppHeader />
      </div>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
        <div className="no-print flex items-center justify-between">
          <Link href={`/resumes/${id}`} className="text-sm text-accent hover:underline">
            ← Back to editor
          </Link>
        </div>

        <ResumePreview resumeId={id} userName={session.user.name ?? null} userEmail={session.user.email ?? null} />
      </main>
    </div>
  );
}
