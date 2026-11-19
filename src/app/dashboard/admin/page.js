"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  dashboardForRole,
  formatCurrency,
  formatDate,
  formatDateTime,
  statusLabels,
  statusStyles,
} from "@/lib/format";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "services", label: "Service Approvals" },
  { value: "users", label: "Users" },
  { value: "bookings", label: "Bookings" },
  { value: "payments", label: "Payments" },
];

const approvalFilters = ["all", "pending", "approved", "rejected"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  const role = session?.user?.role;
  const currentUserId = session?.user?.id;

  useEffect(() => {
    if (!isPending && role && role !== "admin") {
      router.replace(dashboardForRole(role));
    }
  }, [isPending, role, router]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetch("/admin/stats");
      setStats(result.stats);
    } catch (err) {
      setError(err.message || "Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTab = useCallback(
    async (nextTab) => {
      try {
        setLoading(true);
        setError("");

        if (nextTab === "services") {
          const query =
            approvalFilter === "all"
              ? ""
              : `?approvalStatus=${approvalFilter}`;
          const result = await apiFetch(`/admin/services${query}`);
          setServices(result.services || []);
        } else if (nextTab === "users") {
          const result = await apiFetch("/users");
          setUsers(result.users || []);
        } else if (nextTab === "bookings") {
          const query =
            bookingFilter === "all" ? "" : `?status=${bookingFilter}`;
          const result = await apiFetch(`/admin/bookings${query}`);
          setBookings(result.bookings || []);
        } else if (nextTab === "payments") {
          const result = await apiFetch("/admin/payments");
          setPayments(result.payments || []);
        } else {
          const result = await apiFetch("/admin/stats");
          setStats(result.stats);
        }
      } catch (err) {
        setError(err.message || "Unable to load this section.");
      } finally {
        setLoading(false);
      }
    },
    [approvalFilter, bookingFilter]
  );

  useEffect(() => {
    if (role !== "admin") return undefined;

    const timer = setTimeout(() => loadTab(tab), 0);

    return () => clearTimeout(timer);
  }, [role, tab, loadTab]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    if (!query) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, userSearch]);

  const approveService = async (service, approvalStatus) => {
    try {
      setBusyId(service._id);

      await apiFetch(`/admin/services/${service._id}/approval`, {
        method: "PATCH",
        body: { approvalStatus },
      });

      toast.success(`Service ${approvalStatus}.`);
      await loadTab("services");
    } catch (err) {
      toast.error(err.message || "Unable to update the service.");
    } finally {
      setBusyId("");
    }
  };

  const changeRole = async (user, nextRole) => {
    if (user.id === currentUserId) {
      toast.error("You cannot change your own role.");
      return;
    }

    if (
      !window.confirm(
        `Change ${user.name || user.email} from ${user.role} to ${nextRole}?`
      )
    ) {
      return;
    }

    try {
      setBusyId(user.id);

      await apiFetch(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: { role: nextRole },
      });

      toast.success(`${user.name || user.email} is now ${nextRole}.`);
      await loadTab("users");
    } catch (err) {
      toast.error(err.message || "Unable to update the role.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-7">
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-blue-800 p-7 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
          Admin Dashboard
        </p>
        <h2 className="mt-2 text-3xl font-extrabold">
          Platform Overview
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
          Approve services, manage user roles, monitor bookings and review
          Stripe payments from one place.
        </p>
      </section>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              tab === item.value
                ? "bg-blue-700 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => loadTab(tab)}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {tab === "overview" && (
        <section className="space-y-6">
          {loading && !stats ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl bg-slate-200"
                />
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total Users" value={stats.users} icon="👥" />
                <StatCard label="Services" value={stats.services} icon="🧰" />
                <StatCard label="Bookings" value={stats.bookings} icon="📋" />
                <StatCard
                  label="Paid Revenue"
                  value={formatCurrency(stats.revenue)}
                  icon="💳"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-bold text-slate-900">User Breakdown</h3>
                  <div className="mt-5 space-y-3">
                    <Row label="Customers" value={stats.customers} />
                    <Row label="Technicians" value={stats.technicians} />
                    <Row label="Admins" value={stats.admins} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-bold text-slate-900">Service Health</h3>
                  <div className="mt-5 space-y-3">
                    <Row label="Approved services" value={stats.approvedServices} />
                    <Row
                      label="Waiting for approval"
                      value={stats.pendingServices}
                    />
                    <Row
                      label="New booking requests"
                      value={stats.requestedBookings}
                    />
                    <Row label="Completed bookings" value={stats.completedBookings} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                <p className="font-bold text-blue-900">Quick action</p>
                <p className="mt-2 text-sm text-blue-800">
                  {stats.pendingServices > 0
                    ? `${stats.pendingServices} service(s) are waiting for your approval.`
                    : "All submitted services have been reviewed."}
                </p>
                <button
                  type="button"
                  onClick={() => setTab("services")}
                  className="mt-4 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800"
                >
                  Review Services
                </button>
              </div>
            </>
          ) : null}
        </section>
      )}

      {tab === "services" && (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {approvalFilters.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setApprovalFilter(value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${
                  approvalFilter === value
                    ? "bg-blue-700 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingRows />
          ) : services.length === 0 ? (
            <EmptyBox
              icon="📦"
              title="No services in this view"
              text="Try another approval filter."
            />
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">{service.title}</h3>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          statusStyles[service.approvalStatus] ||
                          statusStyles.pending
                        }`}
                      >
                        {statusLabels[service.approvalStatus] ||
                          service.approvalStatus}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {service.category}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-500">
                      {service.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {service.technicianName} · {formatCurrency(service.basePrice)} ·{" "}
                      {service.serviceMode}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {service.approvalStatus !== "approved" && (
                      <button
                        type="button"
                        onClick={() => approveService(service, "approved")}
                        disabled={busyId === service._id}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {service.approvalStatus !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => approveService(service, "rejected")}
                        disabled={busyId === service._id}
                        className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "users" && (
        <section className="space-y-4">
          <input
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            placeholder="Search users by name or email..."
            className="input-base max-w-md"
          />

          {loading ? (
            <LoadingRows />
          ) : filteredUsers.length === 0 ? (
            <EmptyBox
              icon="👥"
              title="No users found"
              text="Try a different search term."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="hidden grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">
                <p className="col-span-4">User</p>
                <p className="col-span-4">Email</p>
                <p className="col-span-2">Joined</p>
                <p className="col-span-2">Role</p>
              </div>

              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 gap-3 border-b border-slate-100 px-5 py-4 last:border-0 md:grid-cols-12 md:items-center"
                >
                  <div className="md:col-span-4">
                    <p className="font-semibold text-slate-900">
                      {user.name || "Unnamed user"}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs text-blue-600">(you)</span>
                      )}
                    </p>
                    <p className="text-xs capitalize text-slate-400 md:hidden">
                      {user.role}
                    </p>
                    <p className="text-xs text-slate-400 md:hidden">{user.email}</p>
                  </div>

                  <p className="hidden truncate text-sm text-slate-600 md:col-span-4 md:block">
                    {user.email}
                  </p>

                  <p className="hidden text-xs text-slate-500 md:col-span-2 md:block">
                    {formatDate(user.createdAt)}
                  </p>

                  <div className="md:col-span-2">
                    <select
                      value={user.role}
                      onChange={(event) => changeRole(user, event.target.value)}
                      disabled={busyId === user.id || user.id === currentUserId}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                    >
                      <option value="customer">customer</option>
                      <option value="technician">technician</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "bookings" && (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {["all", "requested", "accepted", "in-progress", "completed", "rejected", "cancelled"].map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBookingFilter(value)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${
                    bookingFilter === value
                      ? "bg-blue-700 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {value}
                </button>
              )
            )}
          </div>

          {loading ? (
            <LoadingRows />
          ) : bookings.length === 0 ? (
            <EmptyBox
              icon="📋"
              title="No bookings in this view"
              text="Try another status filter."
            />
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <article
                  key={booking._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">
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
                        statusStyles[booking.paymentStatus] || statusStyles.unpaid
                      }`}
                    >
                      {booking.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                    <p>
                      Customer:{" "}
                      <span className="font-semibold text-slate-800">
                        {booking.customerName}
                      </span>
                    </p>
                    <p>
                      Technician:{" "}
                      <span className="font-semibold text-slate-800">
                        {booking.technicianName}
                      </span>
                    </p>
                    <p>
                      Date:{" "}
                      <span className="font-semibold text-slate-800">
                        {formatDate(booking.bookingDate)}
                      </span>
                    </p>
                    <p>
                      Price:{" "}
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(booking.price)}
                      </span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "payments" && (
        <section>
          {loading ? (
            <LoadingRows />
          ) : payments.length === 0 ? (
            <EmptyBox
              icon="💳"
              title="No payments yet"
              text="Stripe payments will appear after customers pay completed bookings."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Booking</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Transaction</th>
                    <th className="px-5 py-3">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-t border-slate-100 text-slate-600"
                    >
                      <td className="px-5 py-4 font-mono text-xs">
                        {payment.bookingId}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            statusStyles[payment.status] || statusStyles.unpaid
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="max-w-52 truncate px-5 py-4 font-mono text-xs">
                        {payment.transactionId || payment.stripeSessionId || "—"}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {formatDateTime(payment.paidAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-2xl bg-slate-200"
        />
      ))}
    </div>
  );
}

function EmptyBox({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="text-5xl">{icon}</div>
      <h3 className="mt-4 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{text}</p>
    </div>
  );
}
