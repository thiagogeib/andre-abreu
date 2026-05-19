import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Redireciona /login para a área correta se já está autenticado
  if (pathname === "/login") {
    if (session?.user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/painel/dashboard", req.url))
    }
    if (session?.user.role === "CLIENT") {
      return NextResponse.redirect(new URL("/area/dashboard", req.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/painel")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url))
    if (session.user.role !== "ADMIN") return NextResponse.redirect(new URL("/login", req.url))
  }

  if (pathname.startsWith("/area")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url))
    if (session.user.role !== "CLIENT") return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/login", "/painel/:path*", "/area/:path*"],
}
