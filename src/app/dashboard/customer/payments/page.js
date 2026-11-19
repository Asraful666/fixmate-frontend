"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import EmptyState from "@/components/dashboard/EmptyState";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetch("/payments/my");
      setPayments(result.payments || []);
    } catch (err) {
      setError(err.message || "Unable to load your payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadPayments, 0);

    return () => clearTimeout(timer);
  }, [loadPayments]);

  const total = useMemo(
    () =>
      payments
        .filter((payment) => payment.paymentStatus === "paid")
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    [payments]
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
          Payments
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Payment History
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Every completed Stripe payment for your repair jobs appears here.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Paid" value={formatCurrency(total)} icon="💳" accent="emerald" />
        <StatCard label="Payments" value={payments.length} icon="🧾" />
        <StatCard
          label="Successful"
          value={
            payments.filter((payment) => payment.paymentStatus === "paid")
              .length
          }
          icon="✅"
          accent="emerald"
        />
      </section>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadPayments}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No payments yet"
          text="Once a technician completes your job, you can pay securely with Stripe."
          actionHref="/dashboard/customer/bookings"
          actionLabel="Go to My Bookings"
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Technician</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Transaction ID</th>
                <th className="px-5 py-3">Paid At</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment._id}
                  className="border-t border-slate-100 text-slate-600"
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {payment.serviceTitle}
                  </td>
                  <td className="px-5 py-4">{payment.technicianName || "—"}</td>
                  <td className="px-5 py-4 font-bold text-slate-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="max-w-52 truncate px-5 py-4 font-mono text-xs">
                    {payment.transactionId ||
                      payment.stripeSessionId ||
                      "—"}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    {formatDateTime(payment.paidAt)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={payment.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
