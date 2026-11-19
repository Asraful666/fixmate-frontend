
import Link from "next/link";

import FeaturedServices from "@/components/FeaturedServices";

const categories = [
  { name: "Smartphone", icon: "📱", description: "Mobile repair services" },
  { name: "Laptop & PC", icon: "💻", description: "Computer repair services" },
  { name: "AC", icon: "❄️", description: "Air conditioning repair" },
  { name: "Refrigerator", icon: "🧊", description: "Fridge repair services" },
  { name: "TV", icon: "📺", description: "Television repair services" },
  { name: "Washing Machine", icon: "🫧", description: "Laundry appliance repair" },
  { name: "Electrical", icon: "⚡", description: "Electrical repair services" },
];

const steps = [
  {
    number: "01",
    icon: "🔍",
    title: "Find a Service",
    description: "Browse available repair services and choose what you need.",
  },
  {
    number: "02",
    icon: "📝",
    title: "Send a Request",
    description: "Submit your repair request with your problem details.",
  },
  {
    number: "03",
    icon: "🛠️",
    title: "Technician Fixes It",
    description: "A technician accepts your request and completes the repair.",
  },
  {
    number: "04",
    icon: "💳",
    title: "Pay After Completion",
    description: "Pay securely after your repair service is completed.",
  },
];

const benefits = [
  {
    icon: "✓",
    title: "Verified Technicians",
    description: "Find technicians through an organized service platform.",
  },
  {
    icon: "🔒",
    title: "Secure Payments",
    description: "Payment is available after service completion.",
  },
  {
    icon: "🤝",
    title: "Easy Booking",
    description: "Request repair services through a simple process.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 text-white">

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:px-8">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Your Trusted Repair Partner
            </div>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Broken Device?
              <span className="mt-2 block text-cyan-300">
                Get It Fixed by
                <br />
                Trusted Technicians.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-blue-100 sm:text-lg">
              Find reliable repair services for your smartphone,
              laptop, home appliances and more. FixMate makes
              finding the right technician easier.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">

              <Link
                href="/services"
                className="rounded-xl bg-white px-7 py-4 font-bold text-blue-900 shadow-lg transition hover:-translate-y-1 hover:bg-blue-50"
              >
                Explore Services →
              </Link>

              <Link
                href="/about"
                className="rounded-xl border border-white/30 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                How It Works
              </Link>

            </div>

            <div className="mt-10 flex flex-wrap gap-7 text-sm text-blue-100">

              <div>
                <p className="text-xl font-bold text-white">7</p>
                <p>Repair Categories</p>
              </div>

              <div>
                <p className="text-xl font-bold text-white">Easy</p>
                <p>Service Requests</p>
              </div>

              <div>
                <p className="text-xl font-bold text-white">Secure</p>
                <p>After-Service Payment</p>
              </div>

            </div>

          </div>

          {/* HERO VISUAL */}
          <div className="relative mx-auto w-full max-w-lg">

            <div className="absolute inset-5 rounded-full bg-cyan-300/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-sm sm:p-8">

              <div className="rounded-3xl bg-white p-7 text-slate-900 shadow-xl">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Repair Made Simple
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      What needs fixing?
                    </h2>
                  </div>

                  <span className="text-4xl">🔧</span>

                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">

                  {[
                    ["📱", "Smartphone"],
                    ["💻", "Laptop"],
                    ["❄️", "Air Conditioner"],
                    ["🧊", "Refrigerator"],
                  ].map(([icon, name]) => (
                    <Link
                      key={name}
                      href={`/services?category=${encodeURIComponent(name === "Air Conditioner" ? "AC" : name)}`}
                      className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      <span className="text-3xl">{icon}</span>
                      <p className="mt-3 text-sm font-semibold">
                        {name}
                      </p>
                    </Link>
                  ))}

                </div>

                <Link
                  href="/services"
                  className="mt-6 block rounded-xl bg-blue-700 py-4 text-center font-bold text-white transition hover:bg-blue-800"
                >
                  Browse All Services →
                </Link>

              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4">

                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-400/20 text-2xl">
                  ✓
                </span>

                <div>
                  <p className="font-bold text-white">
                    Repair Made Easier
                  </p>
                  <p className="text-sm text-blue-100">
                    Find the service you need.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FEATURED SERVICES */}
      <section className="bg-white px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="font-semibold uppercase tracking-widest text-blue-700">
                Featured Services
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Explore Our Latest Services
              </h2>

              <p className="mt-3 max-w-xl text-slate-500">
                Discover repair services offered by technicians
                on the FixMate platform.
              </p>
            </div>

            <Link
              href="/services"
              className="font-bold text-blue-700 hover:text-blue-900"
            >
              Browse All Services →
            </Link>

          </div>

          <FeaturedServices />

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-50 px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">

            <p className="font-semibold uppercase tracking-widest text-blue-700">
              Simple Process
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              How FixMate Works
            </h2>

            <p className="mt-4 leading-7 text-slate-500">
              Getting your devices repaired is simple.
              Follow these four easy steps.
            </p>

          </div>

          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">

            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >

                <span className="text-sm font-bold tracking-widest text-blue-600">
                  STEP {step.number}
                </span>

                <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  {step.icon}
                </div>

                <h3 className="mt-6 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {step.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* POPULAR CATEGORIES */}
      <section className="bg-white px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="font-semibold uppercase tracking-widest text-blue-700">
              Repair Categories
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              What Can We Help You Fix?
            </h2>

            <p className="mt-4 text-slate-500">
              Explore repair categories and find the service you need.
            </p>

          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/services?category=${encodeURIComponent(category.name)}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl transition group-hover:bg-blue-100">
                  {category.icon}
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  {category.name}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {category.description}
                </p>

                <span className="mt-4 inline-block text-sm font-bold text-blue-700">
                  Explore →
                </span>

              </Link>
            ))}

          </div>

        </div>

      </section>

      {/* WHY CHOOSE FIXMATE */}
      <section className="bg-blue-50 px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">

            <p className="font-semibold uppercase tracking-widest text-blue-700">
              Why FixMate
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              A Better Way to Get Things Fixed
            </h2>

          </div>

          <div className="mt-12 grid gap-7 md:grid-cols-3">

            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-3xl bg-white p-8 shadow-sm"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl font-bold text-blue-700">
                  {benefit.icon}
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {benefit.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* FINAL CTA */}
      <section className="bg-blue-900 px-6 py-20 text-center text-white">

        <div className="mx-auto max-w-3xl">

          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to Fix What Matters?
          </h2>

          <p className="mt-5 leading-8 text-blue-100">
            Explore available repair services and take the
            first step towards getting your device fixed.
          </p>

          <Link
            href="/services"
            className="mt-8 inline-flex rounded-xl bg-white px-8 py-4 font-bold text-blue-900 transition hover:-translate-y-1 hover:bg-blue-50"
          >
            Find a Repair Service →
          </Link>

        </div>

      </section>

    </div>
  );
}
