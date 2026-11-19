
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { authClient, useSession } from "@/lib/auth-client";
import { dashboardForRole } from "@/lib/format";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const requestedCallback = searchParams.get("callbackURL");
  const callbackURL =
    requestedCallback &&
    requestedCallback.startsWith("/") &&
    !requestedCallback.startsWith("//")
      ? requestedCallback
      : "";

  // Logged-in users never see the sign-in form.
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(callbackURL || dashboardForRole(session.user.role));
    }
  }, [isPending, session, router, callbackURL]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (event) => {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const { data, error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw new Error(error.message || "Sign in failed.");
      }

      if (!data) {
        throw new Error("Unable to sign in.");
      }

      toast.success("Welcome back!");

      const role = data.user?.role;
      const destination = callbackURL || dashboardForRole(role);

      router.replace(destination);
      router.refresh();

    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL || "/dashboard",
      });

      if (error) {
        throw new Error(error.message);
      }

    } catch (error) {
      console.error("Google login error:", error);
      toast.error(error.message || "Google login failed.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">

      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl sm:p-10">

        <Link href="/" className="text-2xl font-bold text-blue-700">
          🔧 FixMate
        </Link>

        <div className="mb-8 mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Welcome Back
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Sign in to FixMate
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Access your account and manage your repair services.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs uppercase text-slate-400">
            Or continue with
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <span className="text-lg font-bold text-blue-600">G</span>
          Continue with Google
        </button>

        <p className="mt-7 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-bold text-blue-700 hover:underline"
          >
            Create Account
          </Link>
        </p>

      </div>
    </main>
  );
}

function SignInFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-xl">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
        <p className="mt-5 font-semibold text-slate-600">Loading sign in...</p>
      </div>
    </main>
  );
}
