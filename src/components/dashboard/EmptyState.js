import Link from "next/link";

export default function EmptyState({
  icon = "📭",
  title,
  text,
  actionHref,
  actionLabel,
  children,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="text-5xl">{icon}</div>
      <h3 className="mt-4 text-xl font-bold text-slate-900">{title}</h3>
      {text && <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{text}</p>}

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 inline-block rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
        >
          {actionLabel}
        </Link>
      )}

      {children}
    </div>
  );
}
