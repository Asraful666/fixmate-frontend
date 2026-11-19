"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { authClient, useSession } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";

export default function ProfilePage() {
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    area: "",
    bio: "",
    image: "",
  });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [createdAt, setCreatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await apiFetch("/users/me");
        const user = result.user;

        setForm({
          name: user.name || "",
          phone: user.phone || "",
          area: user.area || "",
          bio: user.bio || "",
          image: user.image || "",
        });
        setEmail(user.email || "");
        setRole(user.role || "customer");
        setCreatedAt(user.createdAt);
      } catch (err) {
        setError(err.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Image upload failed.");
      }

      setForm((current) => ({ ...current, image: result.imageUrl }));
      toast.success("Profile photo uploaded.");
    } catch (err) {
      toast.error(err.message || "Unable to upload the photo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!form.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const result = await apiFetch("/users/me", {
        method: "PATCH",
        body: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          area: form.area.trim(),
          bio: form.bio.trim(),
          image: form.image.trim(),
        },
      });

      // Keep the BetterAuth session display name and photo in sync.
      try {
        await authClient.updateUser({
          name: form.name.trim(),
          image: form.image.trim(),
        });
      } catch {
        // The Express profile is the source of truth; ignore session sync errors.
      }

      toast.success(result.message || "Profile updated.");
    } catch (err) {
      toast.error(err.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-semibold text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-800 p-7 text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
          Account Settings
        </p>
        <h2 className="mt-2 text-3xl font-extrabold">Update Profile</h2>
        <p className="mt-3 text-sm leading-7 text-blue-100">
          Keep your contact details current so technicians and customers can
          reach you.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-blue-100">
            {form.image ? (
              <img
                src={form.image}
                alt={form.name || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-3xl font-bold text-blue-700">
                {form.name?.charAt(0)?.toUpperCase() ||
                  session?.user?.name?.charAt(0)?.toUpperCase() ||
                  "U"}
              </span>
            )}
          </div>

          <div>
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">
              {uploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-xs text-slate-500">
              JPG, PNG or WEBP. Maximum 5MB.
            </p>

            {form.image && (
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, image: "" }))}
                className="mt-2 block text-xs font-semibold text-red-600 hover:underline"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </span>
            <input
              value={form.name}
              onChange={update("name")}
              className="input-base"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Email (read only)
            </span>
            <input
              value={email}
              readOnly
              className="input-base bg-slate-50 text-slate-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Phone
            </span>
            <input
              value={form.phone}
              onChange={update("phone")}
              placeholder="+8801XXXXXXXXX"
              className="input-base"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Area / City
            </span>
            <input
              value={form.area}
              onChange={update("area")}
              placeholder="Dhanmondi, Dhaka"
              className="input-base"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Bio / About
            </span>
            <textarea
              value={form.bio}
              onChange={update("bio")}
              rows={4}
              placeholder="Tell customers about your experience."
              className="input-base resize-y"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <div className="text-xs text-slate-500">
            <p>
              Role:{" "}
              <span className="font-bold capitalize text-blue-700">{role}</span>
            </p>
            <p className="mt-1">Member since {formatDate(createdAt)}</p>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
