
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

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
  },

  user: {
    modelName: "users",

    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
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

  plugins: [
    jwt(),
  ],
});
