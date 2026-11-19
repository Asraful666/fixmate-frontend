"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import ConfirmModal from "@/components/dashboard/ConfirmModal";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { BOOKING_STATUS_ORDER } from "@/lib/constants";
import { statusLabels } from "@/lib/format";

const filters = [
  { value: "all", label: "All" },
  ...BOOKING_STATUS_ORDER.map((status) => ({
    value: status,
    label: statusLabels[status],
  })),
];

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionId, setActionId] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetch("/bookings/my");
      setBookings(result.bookings || []);
    } catch (err) {
      setError(err.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadBookings, 0);

    return () => clearTimeout(timer);
  }, [loadBookings]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? bookings
        : bookings.filter((booking) => booking.status === filter),
    [bookings, filter]
  );

  const cancelBooking = async () => {
    if (!cancelTarget) return;

    try {
      setActionId(cancelTarget._id);

      await apiFetch(`/bookings/${cancelTarget._id}/cancel`, {
        method: "PATCH",
      });

      toast.success("Booking cancelled.");
      setCancelTarget(null);
      await loadBookings();
    } catch (err) {
      toast.error(err.message || "Unable to cancel the booking.");
    } finally {
      setActionId("");
    }
  };

  const payBooking = async (bookingId) => {
    try {
      setActionId(bookingId);

      const result = await apiFetch("/payments/create-checkout-session", {
        method: "POST",
        body: { bookingId },
      });

      if (!result.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.assign(result.url);
    } catch (err) {
      toast.error(err.message || "Unable to start the payment.");
      setActionId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
            My Bookings
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Repair Requests
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Cancel a request while it is still “Requested”. Payment unlocks
            after the technician marks the job completed.
          </p>
        </div>

        <Link
          href="/services"
          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
        >
          + New Request
        </Link>
      </section>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
              filter === item.value
                ? "bg-blue-700 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadBookings}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🧰"
          title="No bookings in this view"
          text="Browse our approved services and send your first repair request."
          actionHref="/services"
          actionLabel="Find a Service"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <article
              key={booking._id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blue-50">
                    {booking.serviceImage || booking.service?.image ? (
                      <img
                        src={booking.serviceImage || booking.service.image}
                        alt={booking.serviceTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-2xl">
                        🔧
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">
                        {booking.serviceTitle}
                      </h3>
                      <StatusBadge status={booking.status} />
                      <StatusBadge status={booking.paymentStatus} />
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Technician:{" "}
                      <span className="font-semibold text-slate-700">
                        {booking.technicianName || "Not assigned"}
                      </span>
                      {booking.serviceMode ? ` · ${booking.serviceMode}` : ""}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Preferred date:{" "}
                      <span className="font-semibold text-slate-700">
                        {formatDate(booking.preferredDate)}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Address:{" "}
                      <span className="font-semibold text-slate-700">
                        {booking.address}
                      </span>
                    </p>

                    {booking.problemDescription && (
                      <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-400">
                        {booking.problemDescription}
                      </p>
                    )}

                    {booking.status === "rejected" &&
                      booking.rejectionReason && (
                        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                          Rejected: {booking.rejectionReason}
                        </p>
                      )}

                    <Link
                      href={`/services/${booking.serviceId}`}
                      className="mt-2 inline-block text-xs font-bold text-blue-700 hover:underline"
                    >
                      View service details →
                    </Link>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 border-t border-slate-100 pt-4 lg:items-end lg:border-0 lg:pt-0">
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {booking.status === "completed"
                        ? "Final amount"
                        : "Base price"}
                    </p>
                    <p className="text-xl font-extrabold text-blue-700">
                      {formatCurrency(
                        booking.status === "completed"
                          ? booking.finalAmount
                          : booking.basePrice
                      )}
                    </p>
                  </div>

                  {booking.status === "requested" && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(booking)}
                      disabled={actionId === booking._id}
                      className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancel Request
                    </button>
                  )}

                  {booking.status === "completed" &&
                    booking.paymentStatus === "unpaid" && (
                      <button
                        type="button"
                        onClick={() => payBooking(booking._id)}
                        disabled={actionId === booking._id}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {actionId === booking._id
                          ? "Opening Stripe..."
                          : "Pay Now"}
                      </button>
                    )}

                  {booking.paymentStatus === "paid" && (
                    <span className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                      ✓ Payment complete
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(cancelTarget)}
        title="Cancel this booking request?"
        message={
          cancelTarget
            ? `“${cancelTarget.serviceTitle}” will be marked as cancelled. This action cannot be undone.`
            : ""
        }
        confirmLabel="Cancel Booking"
        cancelLabel="Keep Booking"
        busy={Boolean(actionId)}
        onConfirm={cancelBooking}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
