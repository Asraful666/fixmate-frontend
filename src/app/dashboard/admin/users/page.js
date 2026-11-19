"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import ConfirmModal from "@/components/dashboard/ConfirmModal";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [roleTarget, setRoleTarget] = useState(null);

  const loadUsers = useCallback(async (term = "") => {
    try {
      setLoading(true);
      setError("");

      const query = term.trim()
        ? `?search=${encodeURIComponent(term.trim())}`
        : "";
      const result = await apiFetch(`/admin/users${query}`);
      setUsers(result.users || []);
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(search), 250);

    return () => clearTimeout(timer);
  }, [search, loadUsers]);

  const changeRole = async () => {
    if (!roleTarget) return;

    try {
      setBusyId(roleTarget.user.id);

      await apiFetch(`/admin/users/${roleTarget.user.id}/role`, {
        method: "PATCH",
        body: { role: roleTarget.nextRole },
      });

      toast.success(
        `${roleTarget.user.name || roleTarget.user.email} is now ${roleTarget.nextRole}.`
      );
      setRoleTarget(null);
      await loadUsers(search);
    } catch (err) {
      toast.error(err.message || "Unable to update the role.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">
          Manage Users
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          User Accounts
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Change a user&apos;s role between customer, technician and admin. You
          cannot change your own role.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users by name or email..."
          className="input-base max-w-md"
        />
        <span className="text-xs font-semibold text-slate-400">
          {users.length} user(s)
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => loadUsers(search)}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No users found"
          text="Try a different search term."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUserId;

                return (
                  <tr
                    key={user.id}
                    className="border-t border-slate-100 text-slate-600"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.name || "Unnamed user"}
                            {isSelf && (
                              <span className="ml-2 text-xs text-indigo-600">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">
                            {user.phone || "No phone"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-56 truncate px-5 py-4">
                      {user.email}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        status={user.role}
                        label={user.role}
                        className="capitalize"
                      />
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          setRoleTarget({
                            user,
                            nextRole: event.target.value,
                          })
                        }
                        disabled={isSelf || busyId === user.id}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                      >
                        <option value="customer">customer</option>
                        <option value="technician">technician</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={Boolean(roleTarget)}
        title="Change this user's role?"
        message={
          roleTarget
            ? `${roleTarget.user.name || roleTarget.user.email} will become ${roleTarget.nextRole}. This takes effect immediately.`
            : ""
        }
        confirmLabel="Change Role"
        tone="primary"
        busy={Boolean(busyId)}
        onConfirm={changeRole}
        onCancel={() => setRoleTarget(null)}
      />
    </div>
  );
}
