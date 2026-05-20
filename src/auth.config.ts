import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Config edge-safe (sem Prisma) — usada no middleware
export default {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      // authorize roda apenas no Node.js runtime (lib/auth.ts)
      authorize: async () => null,
    }),
  ],
} satisfies NextAuthConfig
