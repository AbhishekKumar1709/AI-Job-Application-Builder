import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { ResumeList } from "@/components/ResumeList";
import { AppHeader } from "@/components/AppHeader";

export default async function ResumesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Resumes</h1>
          <Link href="/dashboard" className="text-sm text-accent hover:underline">
            Back to dashboard
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">
          Each resume starts as a copy of your profile, then you can
          tailor it independently for a specific application.
        </p>

        <ResumeList />
      </main>
    </div>
  );
}
