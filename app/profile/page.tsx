import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ProfileEditor } from "@/components/ProfileEditor";
import { AppSidebar } from "@/components/AppSidebar";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <AppSidebar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Your canonical work history, education, and skills — reused when
          building resumes and cover letters.
        </p>

        <ProfileEditor />
      </main>
    </div>
  );
}
