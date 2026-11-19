"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="max-w-md text-center">
        <div className="text-6xl">🛠️</div>

        <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          FixMate hit an unexpected error. Please try again, or head back to the
          home page.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:bg-white"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
