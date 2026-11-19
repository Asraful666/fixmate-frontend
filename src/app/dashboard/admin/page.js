"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import BarChart from "@/components/dashboard/BarChart";
import StatCard from "@/components/dashboard/StatCard";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const bookingStatuses = [
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
];

const approvalStatuses = ["pending", "approved", "rejected"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResult, bookingsResult, servicesResult] = await Promise.all([
        apiFetch("/admin/stats"),
        apiFetch("/admin/bookings"),
        apiFetch("/admin/services"),
      ]);

      setStats(statsResult.stats);
      setBookings(bookingsResult.bookings || []);
      setServices(servicesResult.services || []);
    } catch (err) {
      setError(err.message || "Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadData, 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  const bookingChart = useMemo(
    () =>
      bookingStatuses.map((status) => ({
        status,
        value: bookings.filter((booking) => booking.status === status).length,
      })),
    [bookings]
  );

  const serviceChart = useMemo(
    () =>
      approvalStatuses.map((status) => ({
        status,
        value: services.filter(
          (service) => service.approvalStatus === status
        ).length,
      })),
    [services]
  );

  return (
    <div className="space-y-7">
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-indigo-800 p-7 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
          Admin Dashboard
        </p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Platform Overview
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100">
          Approve services, manage user roles, monitor bookings and review
          Stripe payments from one place.
        </p>
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
      ) : loading && !stats ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        </>
      ) : stats ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Users" value={stats.users} icon="👥" />
            <StatCard
              label="Total Technicians"
              value={stats.technicians}
              icon="🔧"
              accent="emerald"
            />
            <StatCard
              label="Pending Services"
              value={stats.pendingServices}
              icon="⏳"
              accent="amber"
            />
            <StatCard
              label="Paid Revenue"
              value={formatCurrency(stats.revenue)}
              icon="💳"
              accent="indigo"
            />
          </section>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <BarChart
              title="Bookings by Status"
              description="Platform-wide"
              data={bookingChart}
            />
            <BarChart
              title="Services by Approval"
              description="All technicians"
              data={serviceChart}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">
                User Breakdown
              </h3>
              <div className="mt-5 space-y-3">
                <Row label="Customers" value={stats.customers} />
                <Row label="Technicians" value={stats.technicians} />
                <Row label="Admins" value={stats.admins} />
              </div>
            </section>

            <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
              <h3 className="font-bold text-indigo-900">Moderation queue</h3>
              <p className="mt-2 text-sm leading-7 text-indigo-800">
                {stats.pendingServices > 0
                  ? `${stats.pendingServices} service(s) are waiting for your approval.`
                  : "All submitted services have been reviewed."}
              </p>
              <Link
                href="/dashboard/admin/services"
                className="mt-4 inline-block rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-800"
              >
                Review Services
              </Link>
            </section>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickLink
              href="/dashboard/admin/users"
              icon="👥"
              title="Manage Users"
              text={`${stats.users} accounts on the platform.`}
            />
            <QuickLink
              href="/dashboard/admin/bookings"
              icon="📋"
              title="All Bookings"
              text={`${stats.bookings} bookings in total.`}
            />
            <QuickLink
              href="/dashboard/admin/transactions"
              icon="💳"
              title="Transactions"
              text={`${stats.payments} payment records.`}
            />
          </section>
        </>
      ) : null}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}

function QuickLink({ href, icon, title, text }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
        {icon}
      </span>
      <p className="mt-3 font-bold text-slate-900 group-hover:text-indigo-700">
        {title}
      </p>
      <p className="mt-1 text-xs leading-6 text-slate-500">{text}</p>
    </Link>
  );
}
