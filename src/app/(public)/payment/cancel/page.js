import Link from "next/link";

export const metadata = {
  title: "Payment Cancelled",
};

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          ↩️
        </div>

        <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
          Payment cancelled
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          No money was taken. Your booking stays completed and unpaid, so you
          can try the payment again whenever you are ready.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/customer/bookings"
            className="flex-1 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          >
            Try Again
          </Link>
          <Link
            href="/services"
            className="flex-1 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}
