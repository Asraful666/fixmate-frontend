
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { createAuthMiddleware } from "better-auth/api";

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

      // Validate public email registration role
      if (ctx.path === "/sign-up/email") {
        const requestedRole = ctx.body?.role;

        const allowedRoles = [
          "customer",
          "technician",
        ];

        const safeRole = allowedRoles.includes(requestedRole)
          ? requestedRole
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

      // Prevent changing role through profile update
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
