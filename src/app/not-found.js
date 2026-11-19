import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="max-w-md text-center">
        <p className="text-7xl font-extrabold text-blue-700">404</p>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
          >
            Go Home
          </Link>
          <Link
            href="/services"
            className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:bg-white"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </main>
  );
}
