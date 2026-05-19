"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"

type State = "idle" | "loading" | "success" | "error"

export function ChangePasswordForm() {
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === "loading") return

    if (form.newPassword !== form.confirmPassword) {
      setErrorMsg("As senhas não coincidem.")
      setState("error")
      return
    }
    if (form.newPassword.length < 8) {
      setErrorMsg("A nova senha deve ter pelo menos 8 caracteres.")
      setState("error")
      return
    }

    setState("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setErrorMsg((data as { error?: string }).error ?? "Erro ao alterar senha.")
        setState("error")
        return
      }

      setState("success")
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.")
      setState("error")
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <p className="text-sm font-semibold text-foreground">Alterar senha</p>

      {state === "success" && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <p className="text-sm text-emerald-600">Senha alterada com sucesso.</p>
        </div>
      )}

      {state === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2.5">
          <AlertCircle className="size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword" className="text-xs font-medium text-muted-foreground">
            Senha atual
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              required
              value={form.currentPassword}
              onChange={set("currentPassword")}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute inset-y-0 right-2.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-xs font-medium text-muted-foreground">
            Nova senha
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNew ? "text" : "password"}
              required
              minLength={8}
              value={form.newPassword}
              onChange={set("newPassword")}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute inset-y-0 right-2.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">
            Confirmar nova senha
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-2.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full h-9 rounded-lg bg-foreground text-background text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
        >
          {state === "loading" ? "Salvando..." : "Alterar senha"}
        </button>
      </form>
    </div>
  )
}
