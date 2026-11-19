"use client";

import { useEffect } from "react";

const tones = {
  danger: {
    confirm: "bg-red-600 hover:bg-red-700",
    icon: "⚠️",
    iconBg: "bg-red-50 text-red-600",
  },
  warning: {
    confirm: "bg-amber-600 hover:bg-amber-700",
    icon: "⚠️",
    iconBg: "bg-amber-50 text-amber-600",
  },
  primary: {
    confirm: "bg-blue-700 hover:bg-blue-800",
    icon: "❓",
    iconBg: "bg-blue-50 text-blue-700",
  },
};

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape" && !busy) {
        onCancel?.();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const styles = tones[tone] || tones.danger;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={() => {
        if (!busy) onCancel?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${styles.iconBg}`}>
          {styles.icon}
        </div>

        <h2 className="mt-4 text-lg font-extrabold text-slate-900">{title}</h2>

        {message && (
          <p className="mt-2 text-sm leading-7 text-slate-600">{message}</p>
        )}

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 ${styles.confirm}`}
          >
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
