import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Config edge-safe (sem Prisma) — usada no middleware
// Os callbacks precisam estar aqui para o middleware conseguir ler session.user.role
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
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.companyId = (user as { companyId?: string | null }).companyId ?? null
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub ?? ""
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { companyId?: string | null }).companyId =
          (token.companyId as string | null) ?? null
      }
      return session
    },
  },
} satisfies NextAuthConfig
