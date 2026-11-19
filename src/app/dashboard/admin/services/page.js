"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import ConfirmModal from "@/components/dashboard/ConfirmModal";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api";
import { CATEGORY_ICONS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

const filters = ["pending", "approved", "rejected", "all"];

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);

  const loadServices = useCallback(async (approvalFilter) => {
    try {
      setLoading(true);
      setError("");

      const query =
        approvalFilter === "all" ? "" : `?approvalStatus=${approvalFilter}`;
      const result = await apiFetch(`/admin/services${query}`);
      setServices(result.services || []);
    } catch (err) {
      setError(err.message || "Unable to load services.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadServices(filter), 0);

    return () => clearTimeout(timer);
  }, [filter, loadServices]);

  const setApproval = async (service, approvalStatus) => {
    try {
      setBusyId(service._id);

      await apiFetch(`/admin/services/${service._id}/approval`, {
        method: "PATCH",
        body: { approvalStatus },
      });

      toast.success(`Service ${approvalStatus}.`);
      setRejectTarget(null);
      await loadServices(filter);
    } catch (err) {
      toast.error(err.message || "Unable to update the service.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">
          Service Approval
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Review Technician Services
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Approve or reject services from every technician. Pending services are
          shown by default.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${
              filter === value
                ? "bg-indigo-700 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => loadServices(filter)}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No services in this view"
          text="Try another approval filter."
        />
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <article
              key={service._id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex min-w-0 gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-indigo-50">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-2xl">
                      {CATEGORY_ICONS[service.category] || "🔧"}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">
                      {service.title}
                    </h3>
                    <StatusBadge status={service.approvalStatus} />
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

                  <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-500">
                    {service.description}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {service.technicianName} ({service.technicianEmail}) ·{" "}
                    {service.category} · {formatCurrency(service.basePrice)} ·{" "}
                    {formatDate(service.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {service.approvalStatus !== "approved" && (
                  <button
                    type="button"
                    onClick={() => setApproval(service, "approved")}
                    disabled={busyId === service._id}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                {service.approvalStatus !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => setRejectTarget(service)}
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

      <ConfirmModal
        open={Boolean(rejectTarget)}
        title="Reject this service?"
        message={
          rejectTarget
            ? `“${rejectTarget.title}” will be hidden from public pages and marked as rejected.`
            : ""
        }
        confirmLabel="Reject Service"
        busy={Boolean(busyId)}
        onConfirm={() => setApproval(rejectTarget, "rejected")}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
