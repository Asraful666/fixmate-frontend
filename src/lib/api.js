"use client";

// Base URL of the Express API. Override it with NEXT_PUBLIC_API_URL in production.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

let cachedToken = null;
let cachedTokenExpiresAt = 0;

const decodeExpiry = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payload = JSON.parse(window.atob(padded));

    return payload.exp ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
};

// BetterAuth exposes the signed JWT at GET /api/auth/token.
export const getAuthToken = async ({ force = false } = {}) => {
  if (typeof window === "undefined") {
    throw new Error("getAuthToken can only run in the browser.");
  }

  if (
    !force &&
    cachedToken &&
    Date.now() < cachedTokenExpiresAt - 30_000
  ) {
    return cachedToken;
  }

  const response = await fetch("/api/auth/token", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    cachedToken = null;
    cachedTokenExpiresAt = 0;
    return null;
  }

  const data = await response.json();

  if (!data?.token) {
    return null;
  }

  cachedToken = data.token;
  cachedTokenExpiresAt = decodeExpiry(data.token) || Date.now() + 10 * 60 * 1000;

  return cachedToken;
};

export const clearAuthToken = () => {
  cachedToken = null;
  cachedTokenExpiresAt = 0;
};

// Use this for every protected Express request.
export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    auth = true,
    ...rest
  } = options;

  const token = auth ? await getAuthToken() : null;

  if (auth && !token) {
    const error = new Error("Please sign in to continue.");
    error.status = 401;
    throw error;
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(isFormData || body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
    ...rest,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }

    const error = new Error(data?.message || "Request failed.");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
