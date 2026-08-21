import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { ResumeEditor } from "@/components/ResumeEditor";
import { ResumeAITools } from "@/components/ResumeAITools";

export default async function ResumeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col px-6 py-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit resume</h1>
        <div className="flex gap-4">
          <Link href={`/resumes/${id}/preview`} className="text-sm text-accent hover:underline">
            Preview / Export PDF
          </Link>
          <Link href="/resumes" className="text-sm text-accent hover:underline">
            Back to resumes
          </Link>
        </div>
      </div>

      <ResumeEditor resumeId={id} />
      <ResumeAITools resumeId={id} />
    </main>
  );
}
