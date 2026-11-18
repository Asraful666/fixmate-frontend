
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient, signOut, useSession } from "@/lib/auth-client";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
];

function getDashboard(role) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "technician") return "/dashboard/technician";
  return "/dashboard/customer";
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = useSession();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  const role = user?.role || "customer";

  const handleSignOut = async () => {
    try {
      setSigningOut(true);

      const { error } = await signOut();

      if (error) {
        throw new Error(error.message || "Sign out failed.");
      }

      setProfileOpen(false);
      setMobileOpen(false);

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      alert(error.message || "Unable to sign out.");
    } finally {
      setSigningOut(false);
    }
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* BRAND */}
        <Link
          href="/"
          onClick={closeMenus}
          className="flex items-center gap-2"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-2xl text-white">
            🔧
          </span>

          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Fix<span className="text-blue-700">Mate</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition ${
                  active
                    ? "text-blue-700"
                    : "text-slate-600 hover:text-blue-700"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* DESKTOP AUTHENTICATION */}
        <div className="hidden items-center gap-3 md:flex">

          {isPending ? (
            <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : user ? (

            <div className="relative">

              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
              >

                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}

                <span className="max-w-28 truncate text-sm font-semibold text-slate-800">
                  {user.name}
                </span>

                <span className="text-xs text-slate-500">▼</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                  <div className="border-b border-slate-100 p-4">

                    <p className="truncate font-semibold text-slate-900">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                      {role}
                    </span>

                  </div>

                  <div className="p-2">

                    <Link
                      href={getDashboard(role)}
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Update Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {signingOut ? "Signing out..." : "Sign Out"}
                    </button>

                  </div>
                </div>
              )}

            </div>

          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-700"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Sign Up
              </Link>
            </>
          )}

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-2xl text-slate-700 md:hidden"
        >
          {mobileOpen ? "×" : "☰"}
        </button>

      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 shadow-lg md:hidden">

          <div className="flex flex-col gap-2">

            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenus}
                className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {!isPending && (
              user ? (
                <>
                  <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-4">

                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}

                    <div>
                      <p className="font-semibold text-slate-900">
                        {user.name}
                      </p>
                      <p className="text-xs capitalize text-blue-700">
                        {role}
                      </p>
                    </div>

                  </div>

                  <Link
                    href={getDashboard(role)}
                    onClick={closeMenus}
                    className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={closeMenus}
                    className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Update Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    {signingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">

                  <Link
                    href="/sign-in"
                    onClick={closeMenus}
                    className="rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/sign-up"
                    onClick={closeMenus}
                    className="rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>

                </div>
              )
            )}

          </div>
        </div>
      )}

    </header>
  );
}
