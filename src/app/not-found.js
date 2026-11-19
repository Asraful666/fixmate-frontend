import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-16">
      <div className="max-w-lg text-center">
        {/* Repair-themed illustration */}
        <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-blue-100" />
          <span className="absolute -right-2 top-3 h-6 w-6 rounded-full bg-amber-300" />
          <span className="absolute bottom-4 -left-3 h-4 w-4 rounded-full bg-blue-400" />

          <svg
            viewBox="0 0 64 64"
            fill="none"
            className="relative h-24 w-24 text-blue-700"
            aria-hidden="true"
          >
            {/* Wrench */}
            <path
              d="M41.5 8.5a11.5 11.5 0 0 0-9.9 17.2L13.9 43.4a4.6 4.6 0 0 0 6.5 6.5l17.7-17.7A11.5 11.5 0 0 0 55.5 22a1.4 1.4 0 0 0-2.4-1l-5.9 5.9-4.6-1.2-1.2-4.6 5.9-5.9a1.4 1.4 0 0 0-1-2.4 11.6 11.6 0 0 0-4.8-4.3Z"
              fill="currentColor"
              opacity="0.9"
            />
            {/* Screwdriver */}
            <path
              d="M9 55l7.5-7.5 3 3L12 58a2.1 2.1 0 0 1-3-3Z"
              fill="currentColor"
              opacity="0.55"
            />
            <path
              d="M17.6 46.4 33 31l3 3L20.6 49.4l-3-3Z"
              fill="currentColor"
              opacity="0.75"
            />
            {/* Loose bolt */}
            <circle cx="48" cy="49" r="5" stroke="currentColor" strokeWidth="3" />
            <path d="M48 41v3M48 54v3M40 49h3M53 49h3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>

          <span className="absolute -bottom-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-extrabold tracking-widest text-white">
            404
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          This page needs a repair
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          The page you are looking for does not exist, was moved, or the service
          is no longer available. Our technicians could not find this part of
          FixMate.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Back to Home
          </Link>
          <Link
            href="/services"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </main>
  );
}
