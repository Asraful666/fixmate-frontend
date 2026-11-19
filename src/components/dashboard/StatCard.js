export default function StatCard({ label, value, icon, hint, accent = "blue" }) {
  const accents = {
    blue: "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
            accents[accent] || accents.blue
          }`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>

      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
