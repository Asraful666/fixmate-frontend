"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import BarChart from "@/components/dashboard/BarChart";
import EmptyState from "@/components/dashboard/EmptyState";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  formatCurrency,
  formatDate,
  statusLabels,
} from "@/lib/format";

const chartStatuses = [
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
];

export default function CustomerDashboardPage() {
  const { data: session } = useSession();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const stats = useMemo(() => {
    const active = bookings.filter((booking) =>
      ["requested", "accepted", "in-progress"].includes(booking.status)
    ).length;
    const completed = bookings.filter(
      (booking) => booking.status === "completed"
    ).length;

    return { total: bookings.length, active, completed };
  }, [bookings]);

  const chartData = useMemo(
    () =>
      chartStatuses.map((status) => ({
        status,
        label: statusLabels[status],
        value: bookings.filter((booking) => booking.status === status).length,
      })),
    [bookings]
  );

  const recent = bookings.slice(0, 3);

  return (
    <div className="space-y-7">
      <section className="rounded-2xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-7 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
          Customer Dashboard
        </p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
          Track your repair requests, cancel a request while it is still
          pending, and pay securely only after the job is completed.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Requests" value={stats.total} icon="📋" />
        <StatCard label="Active Jobs" value={stats.active} icon="🛠️" accent="amber" />
        <StatCard
          label="Completed Jobs"
          value={stats.completed}
          icon="✅"
          accent="emerald"
        />
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadBookings}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BarChart
            title="Requests by Status"
            description="All your repair requests"
            data={chartData}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">
                Recent Requests
              </h3>
              <Link
                href="/dashboard/customer/bookings"
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="mt-5 space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  icon="🧰"
                  title="No requests yet"
                  text="Browse our approved services and send your first repair request."
                  actionHref="/services"
                  actionLabel="Find a Service"
                />
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {recent.map((booking) => (
                  <Link
                    key={booking._id}
                    href="/dashboard/customer/bookings"
                    className="flex items-center gap-4 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-blue-50">
                      {booking.serviceImage || booking.service?.image ? (
                        <img
                          src={booking.serviceImage || booking.service.image}
                          alt={booking.serviceTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xl">
                          🔧
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {booking.serviceTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {booking.technicianName || "Technician"} ·{" "}
                        {formatDate(booking.preferredDate)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={booking.status} />
                      <span className="text-xs font-bold text-slate-600">
                        {formatCurrency(
                          booking.status === "completed"
                            ? booking.finalAmount
                            : booking.basePrice
                        )}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink
          href="/services"
          icon="🔎"
          title="Browse Services"
          text="Find an approved repair service."
        />
        <QuickLink
          href="/dashboard/customer/bookings"
          icon="📋"
          title="My Bookings"
          text="Cancel or pay for your requests."
        />
        <QuickLink
          href="/dashboard/customer/payments"
          icon="💳"
          title="Payment History"
          text="Review your completed payments."
        />
      </section>
    </div>
  );
}

function QuickLink({ href, icon, title, text }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
        {icon}
      </span>
      <p className="mt-3 font-bold text-slate-900 group-hover:text-blue-700">
        {title}
      </p>
      <p className="mt-1 text-xs leading-6 text-slate-500">{text}</p>
    </Link>
  );
}
