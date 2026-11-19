"use client";

import { useRouter } from "next/navigation";

import ServiceForm from "@/components/dashboard/ServiceForm";

export default function AddServicePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Add a Service
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Publish a Repair Service
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Your name and email are filled from your account. Every new service
          starts as <span className="font-semibold">pending</span> until an admin
          approves it.
        </p>
      </section>

      <ServiceForm
        onSaved={() => router.push("/dashboard/technician/my-services")}
      />
    </div>
  );
}
