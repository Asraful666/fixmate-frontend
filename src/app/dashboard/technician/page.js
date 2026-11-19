"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ServiceForm from "@/components/dashboard/ServiceForm";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { CATEGORY_ICONS } from "@/lib/constants";
import {
  dashboardForRole,
  formatCurrency,
  formatDate,
  statusLabels,
  statusStyles,
} from "@/lib/format";

const jobFilters = [
  { value: "all", label: "All Jobs" },
  { value: "requested", label: "New Requests" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function TechnicianDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [tab, setTab] = useState("services");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [jobFilter, setJobFilter] = useState("all");

  const role = session?.user?.role;

  useEffect(() => {
    if (!isPending && role && role !== "technician") {
      router.replace(dashboardForRole(role));
    }
  }, [isPending, role, router]);

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
    if (role !== "technician") return undefined;

    const timer = setTimeout(loadData, 0);

    return () => clearTimeout(timer);
  }, [role, loadData]);

  const filteredJobs = useMemo(
    () =>
      jobFilter === "all"
        ? bookings
        : bookings.filter((booking) => booking.status === jobFilter),
    [bookings, jobFilter]
  );

  const stats = useMemo(() => {
    const active = bookings.filter((booking) =>
      ["requested", "accepted", "in-progress"].includes(booking.status)
    ).length;
    const completed = bookings.filter(
      (booking) => booking.status === "completed"
    ).length;
    const pending = services.filter(
      (service) => service.approvalStatus === "pending"
    ).length;
    const earned = bookings
      .filter(
        (booking) =>
          booking.status === "completed" && booking.paymentStatus === "paid"
      )
      .reduce((total, booking) => total + Number(booking.price || 0), 0);

    return { active, completed, pending, earned };
  }, [bookings, services]);

  const openCreate = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const handleSaved = async () => {
    closeForm();
    await loadData();
  };

  const toggleAvailability = async (service) => {
    try {
      setBusyId(service._id);

      const result = await apiFetch(`/services/${service._id}/availability`, {
        method: "PATCH",
        body: { isAvailable: !service.isAvailable },
      });

      toast.success(result.message || "Availability updated.");
      await loadData();
    } catch (err) {
      toast.error(err.message || "Unable to update availability.");
    } finally {
      setBusyId("");
    }
  };

  const deleteService = async (service) => {
    if (
      !window.confirm(
        `Delete "${service.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setBusyId(service._id);
      await apiFetch(`/services/${service._id}`, { method: "DELETE" });
      toast.success("Service deleted.");
      await loadData();
    } catch (err) {
      toast.error(err.message || "Unable to delete the service.");
    } finally {
      setBusyId("");
    }
  };

  const updateBookingStatus = async (booking, status, extra = {}) => {
    try {
      setBusyId(booking._id);

      await apiFetch(`/bookings/${booking._id}/status`, {
        method: "PATCH",
        body: { status, ...extra },
      });

      toast.success(`Booking marked as ${statusLabels[status] || status}.`);
      await loadData();
    } catch (err) {
      toast.error(err.message || "Unable to update the booking.");
    } finally {
      setBusyId("");
    }
  };

  const rejectBooking = (booking) => {
    const reason = window.prompt(
      "Why are you rejecting this booking? (optional)"
    );

    if (reason === null) return;

    updateBookingStatus(booking, "rejected", { reason });
  };

  return (
    <div className="space-y-7">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-600 p-7 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
          Technician Dashboard
        </p>
        <h2 className="mt-2 text-3xl font-extrabold">
          Hello, {session?.user?.name?.split(" ")[0] || "Technician"}!
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-100">
          Add repair services, manage availability and move each customer job
          through requested, accepted, in-progress and completed.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Jobs" value={stats.active} icon="🛠️" />
        <StatCard label="Completed Jobs" value={stats.completed} icon="✅" />
        <StatCard label="Pending Approval" value={stats.pending} icon="⏳" />
        <StatCard label="Paid Earnings" value={formatCurrency(stats.earned)} icon="💳" />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setTab("services")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              tab === "services"
                ? "bg-blue-700 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            My Services ({services.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("jobs")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              tab === "jobs"
                ? "bg-blue-700 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Job Requests ({bookings.length})
          </button>
        </div>

        {tab === "services" && !showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
          >
            + Add Service
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-44 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : tab === "services" ? (
        <section className="space-y-5">
          {showForm && (
            <ServiceForm
              key={editingService?._id || "new"}
              initialService={editingService}
              onSaved={handleSaved}
              onCancel={closeForm}
            />
          )}

          {services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-5xl">🧰</div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">
                No services yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Add your first service and wait for admin approval.
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white"
              >
                + Add Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="relative h-40 bg-slate-100">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-4xl">
                        {CATEGORY_ICONS[service.category] || "🔧"}
                      </span>
                    )}

                    <div className="absolute left-3 top-3 flex gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          statusStyles[service.approvalStatus] ||
                          statusStyles.pending
                        }`}
                      >
                        {statusLabels[service.approvalStatus] ||
                          service.approvalStatus}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          service.isAvailable
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        {service.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      {service.category}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {service.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <p className="text-xl font-extrabold text-blue-700">
                        {formatCurrency(service.basePrice)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {service.estimatedDuration}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(service)}
                        className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAvailability(service)}
                        disabled={busyId === service._id}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {service.isAvailable ? "Mark Unavailable" : "Mark Available"}
                      </button>
                      <Link
                        href={`/services/${service._id}`}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Preview
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteService(service)}
                        disabled={busyId === service._id}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {jobFilters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setJobFilter(item.value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  jobFilter === item.value
                    ? "bg-blue-700 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-5xl">📭</div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">
                No jobs in this view
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                New customer requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((booking) => (
                <article
                  key={booking._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {booking.serviceTitle}
                        </h3>
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

                      <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <p>
                          Customer:{" "}
                          <span className="font-semibold text-slate-800">
                            {booking.customerName}
                          </span>
                        </p>
                        <p>
                          Phone:{" "}
                          <span className="font-semibold text-slate-800">
                            {booking.phone}
                          </span>
                        </p>
                        <p>
                          Visit date:{" "}
                          <span className="font-semibold text-slate-800">
                            {formatDate(booking.bookingDate)}
                          </span>
                        </p>
                        <p>
                          Mode:{" "}
                          <span className="font-semibold text-slate-800">
                            {booking.serviceMode}
                          </span>
                        </p>
                        <p className="sm:col-span-2">
                          Address:{" "}
                          <span className="font-semibold text-slate-800">
                            {booking.address}
                          </span>
                        </p>
                        {booking.note && (
                          <p className="sm:col-span-2 text-slate-500">
                            Note: {booking.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                      <p className="text-2xl font-extrabold text-blue-700">
                        {formatCurrency(booking.price)}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {booking.status === "requested" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                updateBookingStatus(booking, "accepted")
                              }
                              disabled={busyId === booking._id}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectBooking(booking)}
                              disabled={busyId === booking._id}
                              className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {booking.status === "accepted" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateBookingStatus(booking, "in-progress")
                            }
                            disabled={busyId === booking._id}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                          >
                            Start Work
                          </button>
                        )}

                        {booking.status === "in-progress" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateBookingStatus(booking, "completed")
                            }
                            disabled={busyId === booking._id}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Mark Completed
                          </button>
                        )}

                        {["completed", "rejected", "cancelled"].includes(
                          booking.status
                        ) && (
                          <span className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
                            No action needed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
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
