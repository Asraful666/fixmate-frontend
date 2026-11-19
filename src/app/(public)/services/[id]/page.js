
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { API_BASE_URL, apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import ProBadge from "@/components/ProBadge";
import RatingStars from "@/components/RatingStars";
import { formatDate } from "@/lib/format";

const API_URL = `${API_BASE_URL}/services`;

const todayInputValue = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);

  return local.toISOString().slice(0, 10);
};

export default function ServiceDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const id = params.id;

  const [service, setService] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewAverage, setReviewAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookingForm, setBookingForm] = useState({
    preferredDate: "",
    address: "",
    phone: "",
    problemDescription: "",
  });
  const [booking, setBooking] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const user = session?.user;
  const isCustomer = user?.role === "customer";

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/${encodeURIComponent(id)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load service details."
          );
        }

        setService(result.service);
        setTechnician(result.technician || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Service details error:", err);
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => controller.abort();
  }, [id]);

  // Public reviews power the average rating on the details page.
  useEffect(() => {
    if (!id) return undefined;

    let cancelled = false;

    const loadReviews = async () => {
      try {
        const response = await fetch(
          `${API_URL}/${encodeURIComponent(id)}/reviews`,
          { cache: "no-store" }
        );
        const result = await response.json();

        if (!cancelled && response.ok && result.success) {
          setReviews(result.reviews || []);
          setReviewAverage(result.average || 0);
        }
      } catch {
        // The page still renders without reviews.
      }
    };

    const timer = setTimeout(loadReviews, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  // Prefill the booking form with the signed-in customer details.
  useEffect(() => {
    if (!user) return undefined;

    const timer = setTimeout(() => {
      setBookingForm((current) => {
        const nextPhone = current.phone || user.phone || "";
        const nextDate = current.preferredDate || todayInputValue();
        const nextAddress = current.address || user.area || "";

        if (
          nextPhone === current.phone &&
          nextDate === current.preferredDate &&
          nextAddress === current.address
        ) {
          return current;
        }

        return {
          ...current,
          phone: nextPhone,
          preferredDate: nextDate,
          address: nextAddress,
        };
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [user]);

  const updateBookingField = (field) => (event) =>
    setBookingForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

  const handleBooking = async (event) => {
    event.preventDefault();

    if (booking) return;

    if (
      !bookingForm.preferredDate ||
      !bookingForm.address.trim() ||
      !bookingForm.phone.trim()
    ) {
      toast.error("Date, address and phone are required.");
      return;
    }

    if (bookingForm.problemDescription.trim().length < 20) {
      toast.error("Problem description must be at least 20 characters.");
      return;
    }

    try {
      setBooking(true);

      await apiFetch("/bookings", {
        method: "POST",
        body: {
          serviceId: service._id,
          preferredDate: bookingForm.preferredDate,
          address: bookingForm.address.trim(),
          phone: bookingForm.phone.trim(),
          problemDescription: bookingForm.problemDescription.trim(),
        },
      });

      toast.success("Repair request sent to the technician.");
      setRequestSent(true);
      setShowRequestForm(false);
    } catch (err) {
      toast.error(err.message || "Unable to send the booking request.");
    } finally {
      setBooking(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          <p className="mt-5 font-semibold text-slate-600">
            Loading service details...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !service) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="max-w-md text-center">
          <div className="text-6xl">🔍</div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Service Not Found
          </h1>

          <p className="mt-3 text-slate-500">
            {error || "The requested service is unavailable."}
          </p>

          <Link
            href="/services"
            className="mt-7 inline-block rounded-xl bg-blue-700 px-7 py-3 font-bold text-white hover:bg-blue-800"
          >
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="bg-blue-950 px-5 py-12 text-white">
        <div className="mx-auto max-w-7xl">

          <Link
            href="/services"
            className="text-sm font-semibold text-blue-200 hover:text-white"
          >
            ← Back to Services
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-widest text-blue-300">
            {service.category}
          </p>

          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
            {service.title}
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-blue-200">
            Professional repair service from FixMate.
            Find the right technician for your needs.
          </p>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="px-5 py-12">

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-9 lg:grid-cols-3">

          {/* LEFT CONTENT */}
          <div className="space-y-8 lg:col-span-2">

            {/* IMAGE */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-72 w-full object-cover sm:h-[420px]"
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-blue-50 text-7xl">
                  🔧
                </div>
              )}

            </div>

            {/* DESCRIPTION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7">

              <h2 className="text-2xl font-bold text-slate-900">
                About This Service
              </h2>

              <div className="mt-3">
                <RatingStars
                  rating={service.rating ?? reviewAverage}
                  reviewCount={service.reviewCount ?? reviews.length}
                />
              </div>

              <p className="mt-5 leading-8 text-slate-600">
                {service.description}
              </p>

            </div>

            {/* SERVICE INFORMATION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7">

              <h2 className="text-2xl font-bold text-slate-900">
                Service Information
              </h2>

              <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">

                <Info
                  icon="🔧"
                  label="Category"
                  value={service.category}
                />

                <Info
                  icon="⏱️"
                  label="Estimated Duration"
                  value={service.estimatedDuration}
                />

                <Info
                  icon="📍"
                  label="Service Area"
                  value={service.serviceArea}
                />

                <Info
                  icon="🏪"
                  label="Service Mode"
                  value={service.serviceMode}
                />

              </div>

            </div>

            {/* TECHNICIAN INFORMATION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7">

              <h2 className="text-2xl font-bold text-slate-900">
                Your Technician
              </h2>

              <div className="mt-6 flex items-start gap-5">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-extrabold text-blue-700">
                  {technician?.image ? (
                    <img
                      src={technician.image}
                      alt={service.technicianName || "Technician"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    service.technicianName?.charAt(0) || "T"
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {service.technicianName || "Professional Technician"}
                  </h3>

                  {(technician?.plan === "pro" ||
                    service.technicianPlan === "pro") && (
                    <ProBadge className="mt-2" />
                  )}

                  <p className="mt-1 text-sm text-slate-500">
                    FixMate Service Technician
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {technician?.area || service.serviceArea}
                  </p>

                  {technician?.bio && (
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                      {technician.bio}
                    </p>
                  )}
                </div>

              </div>

            </div>

            {/* REVIEWS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7">

              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-900">
                  Customer Reviews
                </h2>

                <RatingStars
                  rating={reviewAverage}
                  reviewCount={reviews.length}
                />
              </div>

              {reviews.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                  No reviews yet. Reviews appear after a customer pays for a
                  completed job.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {reviews.map((review) => (
                    <article
                      key={review._id}
                      className="rounded-xl border border-slate-100 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800">
                          {review.customerName || "FixMate customer"}
                        </p>

                        <RatingStars rating={review.rating} />
                      </div>

                      {review.review && (
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {review.review}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(review.reviewedAt)}
                      </p>
                    </article>
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:sticky lg:top-8">

            <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
              ✓ Available for Booking
            </span>

            <p className="mt-7 text-sm font-semibold text-slate-500">
              Starting Price
            </p>

            <h2 className="mt-2 text-4xl font-extrabold text-blue-700">
              ${Number(service.basePrice).toFixed(2)}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Final repair cost may depend on inspection.
            </p>

            <div className="my-7 border-t border-slate-200" />

            <div className="space-y-5">

              <Info
                icon="⏱️"
                label="Duration"
                value={service.estimatedDuration}
              />

              <Info
                icon="📍"
                label="Location"
                value={service.serviceArea}
              />

              <Info
                icon="🏠"
                label="Service Type"
                value={service.serviceMode}
              />

            </div>

            {!user ? (
              <>
                <Link
                  href={`/sign-in?callbackURL=${encodeURIComponent(`/services/${id}`)}`}
                  className="mt-8 block w-full rounded-xl bg-blue-700 px-5 py-4 text-center font-bold text-white transition hover:bg-blue-800"
                >
                  Request Repair →
                </Link>

                <p className="mt-4 text-center text-xs leading-6 text-slate-400">
                  Sign in as a customer to send a repair request.
                </p>
              </>
            ) : isCustomer ? (
              requestSent ? (
                <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <p className="text-3xl">✅</p>
                  <p className="mt-2 font-bold text-emerald-900">
                    Request sent successfully!
                  </p>
                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    Your request is now <strong>Requested</strong>. The
                    technician will review it shortly.
                  </p>
                  <Link
                    href="/dashboard/customer/bookings"
                    className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    Go to My Bookings →
                  </Link>
                </div>
              ) : !showRequestForm ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(true)}
                    className="mt-8 w-full rounded-xl bg-blue-700 px-5 py-4 font-bold text-white transition hover:bg-blue-800"
                  >
                    Request Repair →
                  </button>

                  <p className="mt-4 text-center text-xs leading-6 text-slate-400">
                    Sending a request is free. You pay only after the job is
                    completed.
                  </p>
                </>
              ) : (
                <form onSubmit={handleBooking} className="mt-8 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900">
                      Request This Service
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-600">
                      Name (read only)
                    </span>
                    <input
                      value={user.name || ""}
                      readOnly
                      className="input-base bg-slate-50 text-slate-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-600">
                      Email (read only)
                    </span>
                    <input
                      value={user.email || ""}
                      readOnly
                      className="input-base bg-slate-50 text-slate-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-600">
                      Phone
                    </span>
                    <input
                      value={bookingForm.phone}
                      onChange={updateBookingField("phone")}
                      placeholder="+8801XXXXXXXXX"
                      required
                      className="input-base"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-600">
                      Address
                    </span>
                    <textarea
                      value={bookingForm.address}
                      onChange={updateBookingField("address")}
                      rows={3}
                      placeholder="House, road, area"
                      required
                      className="input-base resize-y"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-600">
                      Preferred Date
                    </span>
                    <input
                      type="date"
                      min={todayInputValue()}
                      value={bookingForm.preferredDate}
                      onChange={updateBookingField("preferredDate")}
                      required
                      className="input-base"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Problem Description</span>
                      <span className="text-slate-400">
                        {bookingForm.problemDescription.trim().length}/20
                      </span>
                    </span>
                    <textarea
                      value={bookingForm.problemDescription}
                      onChange={updateBookingField("problemDescription")}
                      rows={3}
                      minLength={20}
                      placeholder="Describe the problem in at least 20 characters."
                      required
                      className="input-base resize-y"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={booking}
                    className="w-full rounded-xl bg-blue-700 px-5 py-4 font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
                  >
                    {booking ? "Sending Request..." : "Send Repair Request"}
                  </button>

                  <p className="text-center text-xs leading-6 text-slate-400">
                    You will not be charged until the job is completed.
                  </p>
                </form>
              )
            ) : (
              <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
                {user.role === "technician"
                  ? "Only customers can request a repair. You are signed in as a technician."
                  : "Only customers can request a repair. You are signed in as an admin."}
              </div>
            )}

            <div className="mt-7 rounded-xl bg-blue-50 p-4">

              <p className="font-bold text-blue-900">
                Why Choose FixMate?
              </p>

              <ul className="mt-3 space-y-2 text-sm text-blue-800">
                <li>✓ Professional technicians</li>
                <li>✓ Transparent starting prices</li>
                <li>✓ Convenient repair services</li>
              </ul>

            </div>

          </aside>

        </div>

      </section>

    </div>
  );
}

// Reusable information component
function Info({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl">{icon}</span>

      <div>
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 font-semibold text-slate-800">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}
