import { statusBarColors, statusLabels } from "@/lib/format";

// Dependency-free bar chart. Each item is { status|label, value, color }.
export default function BarChart({ title, description, data = [] }) {
  const items = data.filter((item) => Number(item.value) > 0);
  const max = Math.max(...items.map((item) => Number(item.value)), 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {description && (
          <p className="text-xs text-slate-400">{description}</p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
          No data to chart yet.
        </p>
      ) : (
        <div className="mt-6 flex h-48 items-end gap-3 sm:gap-5">
          {items.map((item) => {
            const height = Math.max(
              Math.round((Number(item.value) / max) * 100),
              6
            );
            const key = item.status || item.label;

            return (
              <div
                key={key}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-bold text-slate-700">
                  {item.value}
                </span>

                <div
                  className={`w-full rounded-t-lg transition-all ${
                    item.color ||
                    statusBarColors[item.status] ||
                    "bg-blue-500"
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${item.value}`}
                />

                <span className="max-w-full truncate text-[11px] font-semibold text-slate-500">
                  {item.label || statusLabels[item.status] || item.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
