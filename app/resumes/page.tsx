import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ResumeList } from "@/components/ResumeList";
import { AppSidebar } from "@/components/AppSidebar";

export default async function ResumesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <AppSidebar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Resumes</h1>
        <p className="mt-1 text-sm text-muted">
          Each resume starts as a copy of your profile, then you can
          tailor it independently for a specific application.
        </p>

        <ResumeList />
      </main>
    </div>
  );
}
