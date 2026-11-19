"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import ConfirmModal from "@/components/dashboard/ConfirmModal";
import EmptyState from "@/components/dashboard/EmptyState";
import ServiceForm from "@/components/dashboard/ServiceForm";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api";
import { CATEGORY_ICONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export default function MyServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetch("/services/mine");
      setServices(result.services || []);
    } catch (err) {
      setError(err.message || "Unable to load your services.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadServices, 0);

    return () => clearTimeout(timer);
  }, [loadServices]);

  const toggleAvailability = async (service) => {
    try {
      setBusyId(service._id);

      const result = await apiFetch(`/services/${service._id}/availability`, {
        method: "PATCH",
        body: { isAvailable: !service.isAvailable },
      });

      toast.success(result.message || "Availability updated.");
      await loadServices();
    } catch (err) {
      toast.error(err.message || "Unable to update availability.");
    } finally {
      setBusyId("");
    }
  };

  const deleteService = async () => {
    if (!deleteTarget) return;

    try {
      setBusyId(deleteTarget._id);

      await apiFetch(`/services/${deleteTarget._id}`, { method: "DELETE" });

      toast.success("Service deleted.");
      setDeleteTarget(null);
      await loadServices();
    } catch (err) {
      toast.error(err.message || "Unable to delete the service.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            My Services
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Manage Your Repairs
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Editing a service sends it back to admin approval. Turning
            availability off hides it from public pages immediately.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          + Add Service
        </Link>
      </section>

      {editingService && (
        <ServiceForm
          key={editingService._id}
          initialService={editingService}
          onSaved={async () => {
            setEditingService(null);
            await loadServices();
          }}
          onCancel={() => setEditingService(null)}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadServices}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon="🧰"
          title="No services yet"
          text="Add your first repair service and wait for admin approval."
          actionHref="/dashboard/technician/add-service"
          actionLabel="Add Your First Service"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service._id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
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

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
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
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {service.category}
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {service.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-xl font-extrabold text-emerald-700">
                    {formatCurrency(service.basePrice)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {service.estimatedDuration}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingService(service)}
                    className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
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
                    onClick={() => setDeleteTarget(service)}
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

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete this service?"
        message={
          deleteTarget
            ? `“${deleteTarget.title}” will be removed permanently. Existing bookings will still keep a copy of the service details.`
            : ""
        }
        confirmLabel="Delete Service"
        cancelLabel="Keep Service"
        busy={Boolean(busyId)}
        onConfirm={deleteService}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
