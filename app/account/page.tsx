import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { AccountSettings } from "@/components/AccountSettings";
import { AppHeader } from "@/components/AppHeader";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
          <Link href="/dashboard" className="text-sm text-accent hover:underline">
            Back to dashboard
          </Link>
        </div>

        <AccountSettings />
      </main>
    </div>
  );
}
