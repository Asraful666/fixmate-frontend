"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) return undefined;

    let cancelled = false;

    const verify = async () => {
      try {
        const result = await apiFetch(
          `/payments/verify?session_id=${encodeURIComponent(sessionId)}`
        );

        if (!cancelled) {
          setBooking(result.booking || null);
          setPayment(result.payment || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to verify this payment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const displayError = sessionId ? error : "Missing Stripe session ID.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        {loading && sessionId ? (
          <div className="text-center">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Verifying your payment
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Please wait while Stripe confirms the transaction.
            </p>
          </div>
        ) : displayError ? (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
              ⚠️
            </div>
            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Payment not confirmed
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {displayError}
            </p>
            <Link
              href="/dashboard/customer"
              className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
            >
              Back to My Bookings
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✓
            </div>
            <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
              Payment successful
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Thank you! Your payment has been recorded for this completed
              repair.
            </p>

            {booking && (
              <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Service
                    </p>
                    <p className="mt-1 font-bold text-slate-900">
                      {booking.serviceTitle}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Paid
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Technician</p>
                    <p className="font-semibold text-slate-800">
                      {booking.technicianName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Service date</p>
                    <p className="font-semibold text-slate-800">
                      {formatDate(booking.bookingDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Amount</p>
                    <p className="font-semibold text-slate-800">
                      {formatCurrency(payment?.amount ?? booking.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Transaction</p>
                    <p className="truncate font-mono text-xs text-slate-600">
                      {payment?.transactionId || "Recorded"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/customer"
                className="flex-1 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
              >
                My Bookings
              </Link>
              <Link
                href="/services"
                className="flex-1 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                Browse Services
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
    </div>
  );
}
