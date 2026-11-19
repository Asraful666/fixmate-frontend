import Link from "next/link";

import { CATEGORIES } from "@/lib/constants";

export const metadata = {
  title: "About FixMate",
  description:
    "Learn how FixMate connects customers with trusted repair technicians.",
};

const steps = [
  {
    icon: "🔍",
    title: "Browse approved services",
    text: "Every service is reviewed by an admin before it appears in the marketplace.",
  },
  {
    icon: "📝",
    title: "Send a booking request",
    text: "Choose a date, add your address and describe the problem in a short note.",
  },
  {
    icon: "🛠️",
    title: "Track the repair",
    text: "The technician accepts the request and moves it through in-progress to completed.",
  },
  {
    icon: "💳",
    title: "Pay after completion",
    text: "Stripe checkout unlocks only when the job is completed and still unpaid.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-slate-50">
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold">
            ABOUT FIXMATE
          </span>

          <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">
            Repairs without the guesswork
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
            FixMate is a repair service marketplace where customers book
            approved services from verified technicians, track progress, and
            pay securely after the work is complete.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                👤
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                For customers
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Find the right repair service, send a request with your
                preferred date, and follow every status change from your
                dashboard. You only pay after the technician marks the job as
                completed.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                🔧
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                For technicians
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Publish repair services, manage availability, and receive
                booking requests from customers. Service edits go back through
                admin approval so the marketplace stays trustworthy.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              A clear path from request to payment
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="text-xs font-bold text-slate-300">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-3xl bg-blue-900 p-8 text-white sm:p-10">
            <h2 className="text-2xl font-bold">Repair categories we cover</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={`/services?category=${encodeURIComponent(category)}`}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
                >
                  {category}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/services"
                className="rounded-xl bg-white px-6 py-3 font-bold text-blue-900 hover:bg-blue-50"
              >
                Find a Service
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl border border-white/30 px-6 py-3 font-bold text-white hover:bg-white/10"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
