
"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",

  sessionOptions: {
    refetchOnWindowFocus: true,
    refetchInterval: 0,
    refetchWhenOffline: false,
  },
});

// Authentication Methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
