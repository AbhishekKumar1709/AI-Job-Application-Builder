import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ApplicationsList } from "@/components/ApplicationsList";
import { AppSidebar } from "@/components/AppSidebar";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <AppSidebar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-1 text-sm text-muted">
          Track companies, roles, statuses, and which resume version you
          used for each application.
        </p>

        <ApplicationsList />
      </main>
    </div>
  );
}
