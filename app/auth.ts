
import { betterAuth } from "better-auth";
import { getPool } from "./db";
import { randomUUID } from "node:crypto";

const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

// Preview deployments must use their own Vercel hostname for Better Auth.
 // Keep the configured canonical URL unchanged in production.
const isPreviewDeployment = process.env.VERCEL_ENV === "preview";

const appUrl =
  (isPreviewDeployment && vercelUrl) ||
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
