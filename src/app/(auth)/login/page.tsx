"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plane, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (!res) {
        setError("Erro ao conectar. Tente novamente.")
        return
      }

      if (res.error) {
        setError("E-mail ou senha incorretos.")
        return
      }

      // Busca sessão para redirecionar por role
      const sessionRes = await fetch("/api/auth/session")
      const session = await sessionRes.json()
      const role = session?.user?.role

      if (role === "ADMIN") {
        window.location.href = "/painel/dashboard"
      } else if (role === "CLIENT") {
        window.location.href = "/area/dashboard"
      } else {
        window.location.href = "/"
      }
    } catch (err) {
      console.error("[login] erro inesperado:", err)
      setError("Erro inesperado. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, oklch(0.18 0.05 248) 0%, oklch(0.30 0.075 248) 100%)" }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10 cursor-pointer">
          <Plane className="w-5 h-5 -rotate-45" style={{ color: "oklch(0.74 0.14 81)" }} />
          <span className="text-white font-semibold tracking-wide">André Abreu</span>
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Entrar na plataforma</h1>
          <p className="text-white/40 text-sm mb-8">Área restrita para clientes e administrador.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70 text-xs font-medium">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-white/8 border-white/15 text-white placeholder:text-white/25 focus-visible:ring-[oklch(0.74_0.14_81)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/70 text-xs font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/8 border-white/15 text-white placeholder:text-white/25 focus-visible:ring-[oklch(0.74_0.14_81)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              onClick={(e) => {
                // Garante que handleSubmit é chamado mesmo se o form não disparar
                if (e.currentTarget.form) return
                handleSubmit(e as unknown as React.FormEvent)
              }}
              className="w-full h-9 rounded-lg font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-opacity"
              style={{ background: "oklch(0.74 0.14 81)", color: "oklch(0.18 0.05 248)" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-6">
            Primeiro acesso? Verifique seu e-mail para as credenciais.
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-white/30 text-xs hover:text-white/60 transition-colors cursor-pointer">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  )
}
