
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import {
  createAuthMiddleware,
  APIError,
} from "better-auth/api";

import clientPromise, { dbName } from "./mongodb";

const client = await clientPromise;
const database = client.db(dbName);

// Google OAuth Credentials
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Keep issuer, audience, trusted origin and Express verification in sync.
const authBaseUrl = (
  process.env.BETTER_AUTH_URL || "http://localhost:3000"
).replace(/\/+$/, "");

// BetterAuth Configuration
export const auth = betterAuth({
  appName: "FixMate",

  baseURL: authBaseUrl,

  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [
    authBaseUrl,
  ],

  database: mongodbAdapter(database),

  // Email and Password Authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },

  // Google OAuth Configuration
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            prompt: "select_account",
          },
        }
      : {},

  // Demo reviewers switch between the four seeded accounts quickly, so the
  // BetterAuth default of 3 sign-in attempts per 10 seconds is too strict.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 20 },
      "/sign-up/email": { window: 60, max: 10 },
    },
  },

  // User Configuration
  user: {
    modelName: "users",

    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },

      phone: {
        type: "string",
        required: false,
      },

      area: {
        type: "string",
        required: false,
      },

      bio: {
        type: "string",
        required: false,
      },
    },
  },

  // Authentication Security Hooks
  hooks: {
    before: createAuthMiddleware(async (ctx) => {

      // Validate public email registration
      if (ctx.path === "/sign-up/email") {
        const { role, password } = ctx.body || {};

        // Password validation
        if (
          typeof password !== "string" ||
          password.length < 6 ||
          !/[A-Z]/.test(password) ||
          !/[a-z]/.test(password)
        ) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Password must contain at least 6 characters, one uppercase and one lowercase letter.",
          });
        }

        // Only customer and technician can register publicly
        const allowedRoles = [
          "customer",
          "technician",
        ];

        const safeRole = allowedRoles.includes(role)
          ? role
          : "customer";

        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              role: safeRole,
            },
          },
        };
      }

      // Prevent users from changing their own role
      if (
        ctx.path === "/update-user" &&
        ctx.body &&
        Object.prototype.hasOwnProperty.call(ctx.body, "role")
      ) {
        const { role, ...safeBody } = ctx.body;

        return {
          context: {
            ...ctx,
            body: safeBody,
          },
        };
      }
    }),
  },

  // BetterAuth Plugins
  plugins: [
    jwt({
      jwt: {
        issuer: authBaseUrl,
        audience: authBaseUrl,
      },
    }),
  ],
});
