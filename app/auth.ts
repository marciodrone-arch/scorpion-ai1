
import { betterAuth } from "better-auth";
import { getPool } from "./db";
import { randomUUID } from "node:crypto";

const appUrl =
  process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: getPool(),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  advanced: {
    database: {
      generateId: () => randomUUID(),
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: appUrl,

  trustedOrigins: [appUrl],
});
