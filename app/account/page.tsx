import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AccountSettings } from "@/components/AccountSettings";
import { AppSidebar } from "@/components/AppSidebar";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col sm:flex-row">
      <AppSidebar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>

        <AccountSettings />
      </main>
    </div>
  );
}
