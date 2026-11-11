
import { betterAuth } from "better-auth";
import { getPool } from "./db";
import { randomUUID } from "node:crypto";

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

  baseURL:
    process.env.BETTER_AUTH_URL || "http://localhost:3000",

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "https://scorpion-ai1-5hf73b403-scorpin-ia.vercel.app",
    "https://scorpion-ai1-*.vercel.app",
  ],
});
