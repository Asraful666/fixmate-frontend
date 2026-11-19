"use client";

import { statusLabels, statusStyles } from "@/lib/format";

export default function StatusBadge({ status, label, className = "" }) {
  if (!status) return null;

  const roleStyles = {
    customer: "bg-blue-50 text-blue-700 border-blue-200",
    technician: "bg-emerald-50 text-emerald-700 border-emerald-200",
    admin: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  const style =
    statusStyles[status] ||
    roleStyles[status] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${style} ${className}`}
    >
      {label || statusLabels[status] || status}
    </span>
  );
}
