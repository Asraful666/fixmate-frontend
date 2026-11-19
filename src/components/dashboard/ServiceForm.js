"use client";

import { useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";

const emptyForm = {
  title: "",
  category: "Smartphone",
  description: "",
  image: "",
  basePrice: "",
  serviceMode: "Home Visit",
  estimatedDuration: "",
  serviceArea: "",
};

export default function ServiceForm({
  initialService = null,
  onSaved,
  onCancel,
}) {
  const { data: session } = useSession();

  const [form, setForm] = useState(() =>
    initialService
      ? {
          title: initialService.title || "",
          category: initialService.category || "Smartphone",
          description: initialService.description || "",
          image: initialService.image || "",
          basePrice: initialService.basePrice ?? "",
          serviceMode: initialService.serviceMode || "Home Visit",
          estimatedDuration: initialService.estimatedDuration || "",
          serviceArea: initialService.serviceArea || "",
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isEditing = Boolean(initialService?._id);

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
      toast.success("Service image uploaded.");
    } catch (error) {
      const message = error.message || "Unable to upload the image.";

      toast.error(
        /forbidden|imgbb/i.test(message)
          ? "ImgBB rejected the API key. Update IMGBB_API_KEY with a valid key from api.imgbb.com."
          : message
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    if (!Number(form.basePrice) || Number(form.basePrice) <= 0) {
      toast.error("Base price must be a positive number.");
      return;
    }

    if (!form.estimatedDuration.trim() || !form.serviceArea.trim()) {
      toast.error("Duration and service area are required.");
      return;
    }

    if (!form.image) {
      toast.error("Please upload a service image.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        basePrice: Number(form.basePrice),
        estimatedDuration: form.estimatedDuration.trim(),
        serviceArea: form.serviceArea.trim(),
        image: form.image.trim(),
      };

      const result = await apiFetch(
        isEditing ? `/services/${initialService._id}` : "/services",
        {
          method: isEditing ? "PATCH" : "POST",
          body: payload,
        }
      );

      toast.success(
        result.message ||
          (isEditing
            ? "Service updated and sent for approval."
            : "Service submitted. Waiting for admin approval.")
      );

      onSaved?.();
    } catch (error) {
      toast.error(error.message || "Unable to save the service.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit Service" : "Add New Service"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {isEditing
              ? "Saving an edit sends the service back to admin approval."
              : "New services stay hidden from customers until an admin approves them."}
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Technician Name (read only)
          </span>
          <input
            value={session?.user?.name || ""}
            readOnly
            className="input-base bg-slate-50 text-slate-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Technician Email (read only)
          </span>
          <input
            value={session?.user?.email || ""}
            readOnly
            className="input-base bg-slate-50 text-slate-500"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Service Title">
          <input
            value={form.title}
            onChange={update("title")}
            placeholder="e.g. iPhone Screen Replacement"
            className="input-base"
            required
          />
        </Field>

        <Field label="Category">
          <select
            value={form.category}
            onChange={update("category")}
            className="input-base"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Base Price (USD)">
          <input
            type="number"
            min="1"
            step="0.01"
            value={form.basePrice}
            onChange={update("basePrice")}
            placeholder="50"
            className="input-base"
            required
          />
        </Field>

        <Field label="Service Mode">
          <select
            value={form.serviceMode}
            onChange={update("serviceMode")}
            className="input-base"
          >
            {SERVICE_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Estimated Duration">
          <input
            value={form.estimatedDuration}
            onChange={update("estimatedDuration")}
            placeholder="e.g. 1-2 hours"
            className="input-base"
            required
          />
        </Field>

        <Field label="Service Area">
          <input
            value={form.serviceArea}
            onChange={update("serviceArea")}
            placeholder="e.g. Dhanmondi, Dhaka"
            className="input-base"
            required
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={update("description")}
            rows={4}
            placeholder="Describe what this service includes, warranty and notes."
            className="input-base resize-y"
            required
          />
        </Field>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-700">Service Image</p>
        <p className="mt-1 text-xs text-slate-500">
          Upload a JPG, PNG or WEBP image (max 5MB) through ImgBB.
        </p>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-24 w-32 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
            {form.image ? (
              <img
                src={form.image}
                alt="Service preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl">🔧</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800">
              {uploading
                ? "Uploading..."
                : form.image
                  ? "Replace Image"
                  : "Upload Image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {form.image && (
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({ ...current, image: "" }))
                }
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="mt-5 w-full rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-50 sm:w-auto"
      >
        {saving
          ? "Saving..."
          : isEditing
            ? "Save and Request Approval"
            : "Submit for Approval"}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
