"use client";

import { useCallback, useEffect, useState } from "react";

import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api";
import { BOOKING_STATUS_ORDER } from "@/lib/constants";
import { formatCurrency, formatDate, statusLabels } from "@/lib/format";

const filters = [
  { value: "all", label: "All" },
  ...BOOKING_STATUS_ORDER.map((status) => ({
    value: status,
    label: statusLabels[status],
  })),
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async (status) => {
    try {
      setLoading(true);
      setError("");

      const query = status === "all" ? "" : `?status=${status}`;
      const result = await apiFetch(`/admin/bookings${query}`);
      setBookings(result.bookings || []);
    } catch (err) {
      setError(err.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadBookings(filter), 0);

    return () => clearTimeout(timer);
  }, [filter, loadBookings]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">
          All Bookings
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Platform Bookings
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Read-only view of every repair request with status, payment state and
          amount.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
              filter === item.value
                ? "bg-indigo-700 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

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
            onClick={() => loadBookings(filter)}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No bookings in this view"
          text="Try another status filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Technician</th>
                <th className="px-5 py-3">Preferred Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-t border-slate-100 text-slate-600"
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {booking.serviceTitle}
                  </td>
                  <td className="px-5 py-4">
                    <p>{booking.customerName}</p>
                    <p className="text-xs text-slate-400">
                      {booking.customerEmail}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p>{booking.technicianName}</p>
                    <p className="text-xs text-slate-400">
                      {booking.technicianEmail}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    {formatDate(booking.preferredDate)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.paymentStatus} />
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900">
                    {formatCurrency(
                      booking.status === "completed"
                        ? booking.finalAmount
                        : booking.basePrice
                    )}
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
