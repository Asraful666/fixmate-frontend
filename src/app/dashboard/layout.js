"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { useSession } from "@/lib/auth-client";
import { dashboardForRole, roleForPath } from "@/lib/format";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const user = session?.user;
  const role = user?.role || "customer";
  const requiredRole = roleForPath(pathname);
  const forbidden = Boolean(user && requiredRole && requiredRole !== role);

  useEffect(() => {
    if (!isPending && !user) {
      router.replace(
        `/sign-in?callbackURL=${encodeURIComponent(pathname || "/dashboard")}`
      );
      return;
    }

    // A logged-in user opening another role's route is sent to their own dashboard.
    if (forbidden) {
      router.replace(dashboardForRole(role));
    }
  }, [isPending, user, forbidden, role, router, pathname]);

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

  if (!user || forbidden) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <p className="text-center font-semibold text-slate-600">
          {forbidden
            ? "This page belongs to another role. Redirecting to your dashboard..."
            : "Redirecting to sign in..."}
        </p>
      </div>
    );
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
