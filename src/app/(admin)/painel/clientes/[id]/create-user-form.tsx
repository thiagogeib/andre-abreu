"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Plus, X } from "lucide-react"

interface Props {
  companyId: string
}

export function CreateUserForm({ companyId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function reset() {
    setForm({ name: "", email: "", password: "" })
    setErrors({})
    setOpen(false)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Nome obrigatório"
    if (!form.email.trim()) e.email = "E-mail obrigatório"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido"
    if (!form.password.trim()) e.password = "Senha obrigatória"
    else if (form.password.length < 8) e.password = "Mínimo 8 caracteres"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/companies/${companyId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error((data as { error?: string }).error ?? "Erro ao criar usuário")
        return
      }
      toast.success("Acesso criado com sucesso")
      reset()
      router.refresh()
    } catch {
      toast.error("Erro inesperado")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <Plus className="size-4" />
        Criar acesso para usuário
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Novo usuário de acesso</p>
        <button
          type="button"
          onClick={reset}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="user-name" className="text-xs">
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input
            id="user-name"
            placeholder="Nome completo"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="user-email" className="text-xs">
            E-mail <span className="text-destructive">*</span>
          </Label>
          <Input
            id="user-email"
            type="email"
            placeholder="usuario@empresa.com.br"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="user-password" className="text-xs">
            Senha temporária <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="user-password"
              type={showPwd ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              aria-invalid={!!errors.password}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPwd ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Informe as credenciais ao usuário. Ele poderá alterar a senha após o primeiro acesso.
      </p>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={reset}
          className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground border border-border hover:bg-muted transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {loading ? "Criando..." : "Criar acesso"}
        </button>
      </div>
    </form>
  )
}
