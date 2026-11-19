"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmModal from "@/components/dashboard/ConfirmModal";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate, statusLabels } from "@/lib/format";

const filters = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function TechnicianRequestsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [completeTarget, setCompleteTarget] = useState(null);
  const [finalAmount, setFinalAmount] = useState("");

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetch("/bookings/technician");
      setBookings(result.bookings || []);
    } catch (err) {
      setError(err.message || "Unable to load service bookings.");
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

  const updateStatus = async (booking, status, extra = {}) => {
    try {
      setBusyId(booking._id);

      await apiFetch(`/bookings/${booking._id}/status`, {
        method: "PATCH",
        body: { status, ...extra },
      });

      toast.success(`Booking marked as ${statusLabels[status] || status}.`);
      setRejectTarget(null);
      setRejectReason("");
      setCompleteTarget(null);
      setFinalAmount("");
      await loadBookings();
    } catch (err) {
      toast.error(err.message || "Unable to update the booking.");
    } finally {
      setBusyId("");
    }
  };

  const openComplete = (booking) => {
    setCompleteTarget(booking);
    setFinalAmount(String(booking.finalAmount || booking.basePrice || ""));
  };

  const confirmComplete = () => {
    const amount = Number(finalAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Final amount must be greater than 0.");
      return;
    }

    updateStatus(completeTarget, "completed", { finalAmount: amount });
  };

  const confirmReject = () => {
    updateStatus(rejectTarget, "rejected", { reason: rejectReason.trim() });
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Manage Requests
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Customer Job Requests
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Move each job through the pipeline: Requested → Accepted → In Progress
          → Completed. Set the final amount when you complete the work.
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
                ? "bg-emerald-600 text-white"
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
              className="h-44 animate-pulse rounded-2xl bg-slate-200"
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
          icon="📭"
          title="No jobs in this view"
          text="New customer requests for your services will appear here."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <article
              key={booking._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {booking.serviceTitle}
                    </h3>
                    <StatusBadge status={booking.status} />
                    <StatusBadge status={booking.paymentStatus} />
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
                        {booking.customerPhone || "Not provided"}
                      </span>
                    </p>
                    <p>
                      Preferred date:{" "}
                      <span className="font-semibold text-slate-800">
                        {formatDate(booking.preferredDate)}
                      </span>
                    </p>
                    <p>
                      Mode:{" "}
                      <span className="font-semibold text-slate-800">
                        {booking.serviceMode || "—"}
                      </span>
                    </p>
                    <p className="sm:col-span-2">
                      Address:{" "}
                      <span className="font-semibold text-slate-800">
                        {booking.address}
                      </span>
                    </p>
                    <p className="sm:col-span-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
                      {booking.problemDescription}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-3 border-t border-slate-100 pt-4 lg:items-end lg:border-0 lg:pt-0">
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {booking.status === "completed"
                        ? "Final amount"
                        : "Base price"}
                    </p>
                    <p className="text-2xl font-extrabold text-emerald-700">
                      {formatCurrency(
                        booking.status === "completed"
                          ? booking.finalAmount
                          : booking.basePrice
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {booking.status === "requested" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(booking, "accepted")
                          }
                          disabled={busyId === booking._id}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectTarget(booking);
                            setRejectReason("");
                          }}
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
                          updateStatus(booking, "in-progress")
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
                        onClick={() => openComplete(booking)}
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

      <ConfirmModal
        open={Boolean(completeTarget)}
        title="Complete this job"
        message={
          completeTarget
            ? `Enter the final amount to charge for “${completeTarget.serviceTitle}”. The customer will pay this amount with Stripe.`
            : ""
        }
        confirmLabel="Mark Completed"
        tone="primary"
        busy={Boolean(busyId)}
        onConfirm={confirmComplete}
        onCancel={() => setCompleteTarget(null)}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Final Amount (USD)
          </span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={finalAmount}
            onChange={(event) => setFinalAmount(event.target.value)}
            className="input-base"
          />
        </label>
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(rejectTarget)}
        title="Reject this request?"
        message={
          rejectTarget
            ? `“${rejectTarget.serviceTitle}” from ${rejectTarget.customerName} will be marked as rejected.`
            : ""
        }
        confirmLabel="Reject Request"
        busy={Boolean(busyId)}
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Reason (optional)
          </span>
          <textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={3}
            placeholder="Tell the customer why you cannot take this job."
            className="input-base resize-y"
          />
        </label>
      </ConfirmModal>
    </div>
  );
}
