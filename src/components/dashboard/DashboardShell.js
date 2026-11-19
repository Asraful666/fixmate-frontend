"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { signOut } from "@/lib/auth-client";
import { dashboardForRole } from "@/lib/format";

const roleDetails = {
  customer: {
    label: "Customer",
    icon: "👤",
    subtitle: "Track your repair requests",
  },
  technician: {
    label: "Technician",
    icon: "🔧",
    subtitle: "Manage your services and jobs",
  },
  admin: {
    label: "Admin",
    icon: "🛡️",
    subtitle: "Platform overview and approvals",
  },
};

export default function DashboardShell({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const role = user?.role || "customer";
  const details = roleDetails[role] || roleDetails.customer;

  const links = [
    {
      name: role === "admin" ? "Admin Panel" : "Dashboard",
      href: dashboardForRole(role),
      icon: role === "admin" ? "🛡️" : "📊",
    },
    { name: "Update Profile", href: "/dashboard/profile", icon: "⚙️" },
    { name: "Browse Services", href: "/services", icon: "🔎" },
  ];

  const handleSignOut = async () => {
    try {
      setSigningOut(true);

      const { error } = await signOut();

      if (error) {
        throw new Error(error.message || "Sign out failed.");
      }

      toast.success("Signed out.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Unable to sign out.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-100 p-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-xl text-white">
              🔧
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              Fix<span className="text-blue-700">Mate</span>
            </span>
          </Link>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {user?.name || "FixMate User"}
              </p>
              <p className="truncate text-xs capitalize text-blue-700">
                {details.label}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                }`}
              >
                <span>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-slate-100 p-4">
          <p className="px-4 text-xs text-slate-400">{details.subtitle}</p>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl lg:hidden">
              🔧
            </Link>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
                {details.label} Dashboard
              </p>
              <h1 className="text-lg font-extrabold text-slate-900">
                {details.subtitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:block"
            >
              Home
            </Link>

            <Link
              href="/dashboard/profile"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Profile
            </Link>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                pathname === link.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
