"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { API_BASE_URL } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default function FeaturedServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadFeatured = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/services?sort=newest`,
          { cache: "no-store", signal: controller.signal }
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load services.");
        }

        setServices((result.services || []).slice(0, 6));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load featured services.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadFeatured();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-96 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    );
  }

  if (error || services.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
          🔧
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-900">
          {error
            ? "Services are temporarily unavailable"
            : "Approved services are coming soon"}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {error
            ? "Please make sure the FixMate backend is running and try again."
            : "Technicians are preparing their services for approval."}
        </p>
        <Link
          href="/services"
          className="mt-5 inline-flex rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800"
        >
          Browse Services
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <article
          key={service._id}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="h-44 shrink-0 overflow-hidden bg-slate-100">
            {service.image ? (
              <img
                src={service.image}
                alt={service.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-4xl">
                🔧
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {service.category}
              </p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {service.serviceMode}
              </span>
            </div>

            <h3 className="mt-2 line-clamp-1 text-lg font-bold text-slate-900">
              {service.title}
            </h3>

            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">
              {service.description}
            </p>

            <p className="mt-3 text-xs text-slate-500">
              Technician:{" "}
              <span className="font-semibold text-slate-700">
                {service.technicianName || "FixMate Pro"}
              </span>
            </p>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-400">Starting at</p>
                <p className="text-xl font-extrabold text-blue-700">
                  {formatCurrency(service.basePrice)}
                </p>
              </div>

              <Link
                href={`/services/${service._id}`}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
              >
                View Details
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
