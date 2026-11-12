
import { betterAuth } from "better-auth";
import { getPool } from "./db";
import { randomUUID } from "node:crypto";

const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

const appUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  vercelUrl ||
  "http://localhost:3000";

const trustedOrigins = [
  appUrl,
  process.env.NEXT_PUBLIC_APP_URL,
  vercelUrl,
].filter((origin): origin is string => Boolean(origin));

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

  trustedOrigins,
});
