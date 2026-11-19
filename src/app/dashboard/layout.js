"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { useSession } from "@/lib/auth-client";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace(
        `/sign-in?callbackURL=${encodeURIComponent("/dashboard")}`
      );
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          <p className="mt-5 font-semibold text-slate-600">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <p className="text-center font-semibold text-slate-600">
          Redirecting to sign in...
        </p>
      </div>
    );
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
