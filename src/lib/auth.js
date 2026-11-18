
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

export const auth = betterAuth({
  appName: "FixMate",

  baseURL: process.env.BETTER_AUTH_URL,

  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [
    "http://localhost:3000",
  ],

  database: mongodbAdapter(database),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },

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

  hooks: {
    before: createAuthMiddleware(async (ctx) => {

      // Registration security
      if (ctx.path === "/sign-up/email") {
        const { role, password } = ctx.body || {};

        // Server-side password validation
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

        // Allow only customer and technician
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

      // Prevent public role modification
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

  plugins: [
    jwt(),
  ],
});
