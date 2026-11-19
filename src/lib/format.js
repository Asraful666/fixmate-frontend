export const formatCurrency = (value) => {
  const amount = Number(value);

  return `$${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
};

export const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// Consistent badge colours across every dashboard (see assignment PDF):
// Requested = blue, Accepted = indigo, In Progress = amber,
// Completed = green, Rejected / Cancelled = red / gray.
export const statusStyles = {
  requested: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "in-progress": "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unpaid: "bg-orange-50 text-orange-700 border-orange-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const statusLabels = {
  requested: "Requested",
  accepted: "Accepted",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  pending: "Pending",
  approved: "Approved",
  unpaid: "Unpaid",
  paid: "Paid",
};

export const statusBarColors = {
  requested: "bg-blue-500",
  accepted: "bg-indigo-500",
  "in-progress": "bg-amber-500",
  completed: "bg-emerald-500",
  rejected: "bg-red-500",
  cancelled: "bg-slate-400",
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  unpaid: "bg-orange-500",
  paid: "bg-emerald-500",
};

export const dashboardForRole = (role) => {
  if (role === "admin") return "/dashboard/admin";
  if (role === "technician") return "/dashboard/technician";
  return "/dashboard/customer";
};

export const roleForPath = (pathname = "") => {
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/technician")) return "technician";
  if (pathname.startsWith("/dashboard/customer")) return "customer";
  return null;
};
