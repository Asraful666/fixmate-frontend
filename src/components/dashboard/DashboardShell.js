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
    badge: "bg-blue-100 text-blue-700",
  },
  technician: {
    label: "Technician",
    icon: "🔧",
    subtitle: "Manage your services and jobs",
    badge: "bg-emerald-100 text-emerald-700",
  },
  admin: {
    label: "Admin",
    icon: "🛡️",
    subtitle: "Platform overview and approvals",
    badge: "bg-indigo-100 text-indigo-700",
  },
};

const navByRole = {
  customer: [
    { name: "Overview", href: "/dashboard/customer", icon: "📊" },
    {
      name: "My Bookings",
      href: "/dashboard/customer/bookings",
      icon: "📋",
    },
    {
      name: "Payments",
      href: "/dashboard/customer/payments",
      icon: "💳",
    },
  ],
  technician: [
    { name: "Overview", href: "/dashboard/technician", icon: "📊" },
    {
      name: "Add Service",
      href: "/dashboard/technician/add-service",
      icon: "➕",
    },
    {
      name: "My Services",
      href: "/dashboard/technician/my-services",
      icon: "🧰",
    },
    {
      name: "Requests",
      href: "/dashboard/technician/requests",
      icon: "📥",
    },
  ],
  admin: [
    { name: "Overview", href: "/dashboard/admin", icon: "📊" },
    { name: "Users", href: "/dashboard/admin/users", icon: "👥" },
    { name: "Services", href: "/dashboard/admin/services", icon: "🧰" },
    { name: "Bookings", href: "/dashboard/admin/bookings", icon: "📋" },
    {
      name: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: "💳",
    },
  ],
};

const secondaryLinks = [
  { name: "Update Profile", href: "/dashboard/profile", icon: "⚙️" },
  { name: "Browse Services", href: "/services", icon: "🔎" },
  { name: "Back to Home", href: "/", icon: "🏠" },
];

export default function DashboardShell({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const role = user?.role || "customer";
  const details = roleDetails[role] || roleDetails.customer;
  const home = dashboardForRole(role);
  const primaryLinks = navByRole[role] || navByRole.customer;

  const isActive = (href) => {
    if (href === home) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const currentLink =
    [...primaryLinks, ...secondaryLinks].find((link) => isActive(link.href)) ||
    primaryLinks[0];

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

  const sideNav = (compact) => (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {primaryLinks.map((link) => {
        const active = isActive(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            title={compact ? link.name : undefined}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              compact ? "justify-center" : ""
            } ${
              active
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {!compact && <span>{link.name}</span>}
          </Link>
        );
      })}

      <div className="my-3 border-t border-slate-100" />

      {secondaryLinks.map((link) => {
        const active = isActive(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            title={compact ? link.name : undefined}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              compact ? "justify-center" : ""
            } ${
              active
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {!compact && <span>{link.name}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const userCard = (compact) => (
    <div
      className={`flex items-center gap-3 rounded-xl bg-slate-50 p-3 ${
        compact ? "justify-center" : ""
      }`}
    >
      {user?.image ? (
        <img
          src={user.image}
          alt={user.name || "User"}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </span>
      )}

      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">
            {user?.name || "FixMate User"}
          </p>
          <span
            className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${details.badge}`}
          >
            {details.label}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileOpen(false)}
            role="presentation"
          />

          <aside className="relative flex h-full w-72 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-xl text-white">
                  🔧
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  Fix<span className="text-blue-700">Mate</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-4">{userCard(false)}</div>

            {sideNav(false)}

            <div className="border-t border-slate-100 p-3">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:flex ${
            collapsed ? "w-20" : "w-72"
          }`}
        >
          <div
            className={`flex items-center border-b border-slate-100 p-4 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-xl text-white">
                🔧
              </span>
              {!collapsed && (
                <span className="text-xl font-extrabold text-slate-900">
                  Fix<span className="text-blue-700">Mate</span>
                </span>
              )}
            </Link>

            {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                «
              </button>
            )}
          </div>

          <div className="p-3">{userCard(collapsed)}</div>

          {sideNav(collapsed)}

          <div className="border-t border-slate-100 p-3">
            {collapsed ? (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                aria-label="Expand sidebar"
                className="mb-2 w-full rounded-xl px-3 py-2 text-center text-slate-500 hover:bg-slate-100"
              >
                »
              </button>
            ) : (
              <p className="mb-2 px-3 text-xs text-slate-400">
                {details.subtitle}
              </p>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              title={collapsed ? "Sign Out" : undefined}
              className={`w-full rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 ${
                collapsed ? "text-center" : "text-left"
              }`}
            >
              {collapsed ? "⏻" : signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              >
                ☰
              </button>

              <button
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                aria-label="Toggle sidebar"
                className="hidden rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:block"
              >
                ☰
              </button>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700">
                  {details.label} Dashboard
                </p>
                <h1 className="truncate text-base font-extrabold text-slate-900 sm:text-lg">
                  {currentLink?.name || details.subtitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:block"
              >
                Home
              </Link>

              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-3 transition hover:bg-slate-50"
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}

                <span className="hidden text-left sm:block">
                  <span className="block max-w-32 truncate text-xs font-bold text-slate-900">
                    {user?.name || "FixMate User"}
                  </span>
                  <span className="block text-[10px] font-semibold capitalize text-blue-700">
                    {details.label}
                  </span>
                </span>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
