
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { API_BASE_URL } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";

const API_URL = `${API_BASE_URL}/services`;

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesLoading />}>
      <ServicesContent />
    </Suspense>
  );
}

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [services, setServices] = useState([]);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [serviceMode, setServiceMode] = useState(
    searchParams.get("serviceMode") || ""
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search.trim()) params.set("search", search.trim());
        if (category) params.set("category", category);
        if (serviceMode) params.set("serviceMode", serviceMode);

        params.set("sort", sort);

        const response = await fetch(
          `${API_URL}?${params.toString()}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load services."
          );
        }

        setServices(result.services || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Services fetch error:", err);
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchServices, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, serviceMode, sort, reloadKey]);

  // Keep the browser URL shareable, e.g. /services?category=AC
  useEffect(() => {
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (serviceMode) params.set("serviceMode", serviceMode);
    if (sort !== "newest") params.set("sort", sort);

    const query = params.toString();

    router.replace(query ? `/services?${query}` : "/services", {
      scroll: false,
    });
  }, [search, category, serviceMode, sort, router]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setServiceMode("");
    setSort("newest");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 px-5 py-20 text-white">

        <div className="mx-auto max-w-7xl text-center">

          <span className="inline-block rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold">
            FIXMATE REPAIR SERVICES
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Find the Right Repair
            <br />
            Service for You
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
            Discover trusted technicians and professional
            repair services for your home appliances and
            electronic devices.
          </p>

          <div className="mx-auto mt-9 max-w-2xl">
            <div className="flex items-center rounded-2xl bg-white p-2 shadow-xl">

              <span className="px-3 text-xl text-slate-400">
                🔍
              </span>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search repair services..."
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-slate-800 outline-none sm:text-base"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="px-3 text-sm font-semibold text-blue-700"
                >
                  Clear
                </button>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="px-5 py-16">

        <div className="mx-auto max-w-7xl">

          {/* SECTION HEADER */}
          <div className="mb-9 flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
                Explore Our Services
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Available Repair Services
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Find the right professional for your repair needs.
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 px-5 py-3">
              <span className="text-sm font-semibold text-blue-800">
                {services.length} Services Found
              </span>
            </div>

          </div>

          {/* FILTERS */}
          <div className="mb-9 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="">All Categories</option>

                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Service Mode
              </label>

              <select
                value={serviceMode}
                onChange={(e) => setServiceMode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="">All Service Modes</option>
                <option value="Home Visit">Home Visit</option>
                <option value="Shop Drop-off">Shop Drop-off</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Sort By
              </label>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              >
                Reset All Filters
              </button>
            </div>

          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border bg-white"
                >
                  <div className="h-56 animate-pulse bg-slate-200" />

                  <div className="space-y-4 p-6">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}

            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

              <div className="text-4xl">⚠️</div>

              <h3 className="mt-4 text-xl font-bold text-red-800">
                Unable to Load Services
              </h3>

              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>

              <button
                onClick={() => setReloadKey((value) => value + 1)}
                className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>

            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && services.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-20 text-center">

              <div className="text-5xl">🔎</div>

              <h3 className="mt-5 text-2xl font-bold text-slate-800">
                No Services Found
              </h3>

              <p className="mt-3 text-slate-500">
                Try changing your search or filter options.
              </p>

              <button
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Clear Filters
              </button>

            </div>
          )}

          {/* SERVICE CARDS */}
          {!loading && !error && services.length > 0 && (

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">

              {services.map((service) => (

                <article
                  key={service._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* SERVICE IMAGE */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">

                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        🔧
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-blue-800 shadow">
                      {service.category}
                    </span>

                  </div>

                  {/* CARD CONTENT */}
                  <div className="p-6">

                    <div className="flex items-start justify-between gap-3">

                      <h3 className="text-xl font-bold text-slate-900 transition group-hover:text-blue-700">
                        {service.title}
                      </h3>

                    </div>

                    <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
                      {service.description}
                    </p>

                    {/* TECHNICIAN */}
                    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {service.technicianName?.charAt(0) || "T"}
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Service Technician
                        </p>

                        <p className="text-sm font-bold text-slate-800">
                          {service.technicianName || "Professional Technician"}
                        </p>
                      </div>

                    </div>

                    {/* SERVICE DETAILS */}
                    <div className="mt-5 space-y-3">

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Service Mode
                        </span>

                        <span className="font-semibold text-slate-800">
                          {service.serviceMode}
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Estimated Time
                        </span>

                        <span className="font-semibold text-slate-800">
                          {service.estimatedDuration}
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Service Area
                        </span>

                        <span className="font-semibold text-slate-800">
                          {service.serviceArea}
                        </span>

                      </div>

                    </div>

                    {/* PRICE AND BUTTON */}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">

                      <div>
                        <p className="text-xs text-slate-400">
                          Starting Price
                        </p>

                        <p className="text-2xl font-extrabold text-blue-700">
                          ${Number(service.basePrice).toFixed(2)}
                        </p>
                      </div>

                      <Link
                        href={`/services/${encodeURIComponent(service._id)}`}
                        className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                      >
                        View Details →
                      </Link>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

      {/* CTA SECTION */}
      <section className="bg-blue-950 px-5 py-16 text-center text-white">

        <div className="mx-auto max-w-3xl">

          <h2 className="text-3xl font-extrabold">
            Need Help With Your Repair?
          </h2>

          <p className="mt-4 leading-7 text-blue-200">
            Find a professional technician and get your repair
            journey started with FixMate.
          </p>

          <Link
            href="/sign-up"
            className="mt-7 inline-block rounded-xl bg-white px-8 py-4 font-bold text-blue-900 transition hover:bg-blue-100"
          >
            Get Started →
          </Link>

        </div>

      </section>

    </div>
  );
}

function ServicesLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
        <p className="mt-5 font-semibold text-slate-600">
          Loading services...
        </p>
      </div>
    </div>
  );
}
