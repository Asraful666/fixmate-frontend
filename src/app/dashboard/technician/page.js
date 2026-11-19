"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import BarChart from "@/components/dashboard/BarChart";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatCurrency, formatDate, statusLabels } from "@/lib/format";

const chartStatuses = [
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
];

export default function TechnicianDashboardPage() {
  const { data: session } = useSession();

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [serviceResult, bookingResult] = await Promise.all([
        apiFetch("/services/mine"),
        apiFetch("/bookings/technician"),
      ]);

      setServices(serviceResult.services || []);
      setBookings(bookingResult.bookings || []);
    } catch (err) {
      setError(err.message || "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadData, 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  const stats = useMemo(
    () => ({
      total: services.length,
      approved: services.filter(
        (service) => service.approvalStatus === "approved"
      ).length,
      pendingRequests: bookings.filter(
        (booking) => booking.status === "requested"
      ).length,
    }),
    [services, bookings]
  );

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
      <section className="rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-600 p-7 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
          Technician Dashboard
        </p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Hello, {session?.user?.name?.split(" ")[0] || "Technician"}!
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-100">
          Add repair services, manage availability and move every customer job
          through requested, accepted, in-progress and completed.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Services" value={stats.total} icon="🧰" />
        <StatCard
          label="Approved Services"
          value={stats.approved}
          icon="✅"
          accent="emerald"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests}
          icon="📥"
          accent="amber"
        />
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BarChart
            title="Jobs by Status"
            description="All requests for your services"
            data={chartData}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">
                Latest Requests
              </h3>
              <Link
                href="/dashboard/technician/requests"
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Manage all →
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
              <p className="mt-6 rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                No customer requests yet.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {recent.map((booking) => (
                  <Link
                    key={booking._id}
                    href="/dashboard/technician/requests"
                    className="flex items-center gap-4 rounded-xl border border-slate-200 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-emerald-50">
                      {booking.serviceImage || booking.service?.image ? (
                        <img
                          src={booking.serviceImage || booking.service.image}
                          alt={booking.serviceTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-lg">
                          🔧
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {booking.serviceTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {booking.customerName} ·{" "}
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
          href="/dashboard/technician/add-service"
          icon="➕"
          title="Add Service"
          text="Publish a new repair service."
        />
        <QuickLink
          href="/dashboard/technician/my-services"
          icon="🧰"
          title="My Services"
          text="Edit, delete and toggle availability."
        />
        <QuickLink
          href="/dashboard/technician/requests"
          icon="📥"
          title="Manage Requests"
          text="Accept jobs and update status."
        />
      </section>
    </div>
  );
}

function QuickLink({ href, icon, title, text }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
        {icon}
      </span>
      <p className="mt-3 font-bold text-slate-900 group-hover:text-emerald-700">
        {title}
      </p>
      <p className="mt-1 text-xs leading-6 text-slate-500">{text}</p>
    </Link>
  );
}
