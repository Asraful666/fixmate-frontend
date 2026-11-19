"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  dashboardForRole,
  formatCurrency,
  formatDate,
  statusLabels,
  statusStyles,
} from "@/lib/format";

const filters = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionId, setActionId] = useState("");

  const role = session?.user?.role;

  useEffect(() => {
    if (!isPending && role && role !== "customer") {
      router.replace(dashboardForRole(role));
    }
  }, [isPending, role, router]);

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
    if (role !== "customer") return undefined;

    // Defer so the fetch does not set state synchronously inside the effect.
    const timer = setTimeout(loadBookings, 0);

    return () => clearTimeout(timer);
  }, [role, loadBookings]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? bookings
        : bookings.filter((booking) => booking.status === filter),
    [bookings, filter]
  );

  const stats = useMemo(() => {
    const active = bookings.filter((booking) =>
      ["requested", "accepted", "in-progress"].includes(booking.status)
    ).length;
    const completed = bookings.filter(
      (booking) => booking.status === "completed"
    ).length;
    const paid = bookings
      .filter((booking) => booking.paymentStatus === "paid")
      .reduce((total, booking) => total + Number(booking.price || 0), 0);

    return { total: bookings.length, active, completed, paid };
  }, [bookings]);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking request?")) return;

    try {
      setActionId(bookingId);
      await apiFetch(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
      toast.success("Booking cancelled.");
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

      const result = await apiFetch("/payments/create-checkout", {
        method: "POST",
        body: { bookingId },
      });

      if (!result.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.href = result.url;
    } catch (err) {
      toast.error(err.message || "Unable to start the payment.");
      setActionId("");
    }
  };

  return (
    <div className="space-y-7">
      <section className="rounded-2xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-7 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
          Customer Dashboard
        </p>
        <h2 className="mt-2 text-3xl font-extrabold">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
          Track your repair requests, cancel pending bookings and pay securely
          after a job is completed.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Bookings" value={stats.total} icon="📋" />
        <StatCard label="Active Jobs" value={stats.active} icon="🛠️" />
        <StatCard label="Completed" value={stats.completed} icon="✅" />
        <StatCard label="Paid Total" value={formatCurrency(stats.paid)} icon="💳" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">My Bookings</h3>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  filter === item.value
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadBookings}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-5xl">🧰</div>
            <h4 className="mt-4 text-xl font-bold text-slate-800">
              No bookings in this view
            </h4>
            <p className="mt-2 text-sm text-slate-500">
              Browse our approved services and send your first repair request.
            </p>
            <Link
              href="/services"
              className="mt-5 inline-block rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800"
            >
              Find a Service
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {filtered.map((booking) => (
              <article
                key={booking._id}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blue-50">
                      {booking.service?.image ? (
                        <img
                          src={booking.service.image}
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
                        <h4 className="font-bold text-slate-900">
                          {booking.serviceTitle}
                        </h4>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            statusStyles[booking.status] || statusStyles.cancelled
                          }`}
                        >
                          {statusLabels[booking.status] || booking.status}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            statusStyles[booking.paymentStatus] ||
                            statusStyles.unpaid
                          }`}
                        >
                          {booking.paymentStatus === "paid"
                            ? "Paid"
                            : "Payment pending"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Technician:{" "}
                        <span className="font-semibold text-slate-700">
                          {booking.technicianName}
                        </span>{" "}
                        · {booking.serviceMode}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Date:{" "}
                        <span className="font-semibold text-slate-700">
                          {formatDate(booking.bookingDate)}
                        </span>{" "}
                        · {booking.address}
                      </p>

                      {booking.note && (
                        <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                          Note: {booking.note}
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
                    <p className="text-xl font-extrabold text-blue-700">
                      {formatCurrency(booking.price)}
                    </p>

                    {["requested", "accepted"].includes(booking.status) && (
                      <button
                        type="button"
                        onClick={() => cancelBooking(booking._id)}
                        disabled={actionId === booking._id}
                        className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionId === booking._id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    )}

                    {booking.status === "completed" &&
                      booking.paymentStatus !== "paid" && (
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
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
