"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface Props {
  programId: string
}

export function AddSessionForm({ programId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    scheduledAt: "",
    duration: "",
    location: "",
    description: "",
  })

  function reset() {
    setForm({ title: "", scheduledAt: "", duration: "", location: "", description: "" })
    setOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.scheduledAt) {
      toast.error("Preencha título e data/hora")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/programs/${programId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          duration: form.duration ? parseInt(form.duration, 10) : null,
          location: form.location || null,
          description: form.description || null,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Sessão adicionada")
      reset()
      router.refresh()
    } catch {
      toast.error("Erro ao adicionar sessão")
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
        Adicionar sessão
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Nova sessão</p>
        <button
          type="button"
          onClick={reset}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="session-title" className="text-xs">
            Título <span className="text-destructive">*</span>
          </Label>
          <Input
            id="session-title"
            placeholder="Ex: Módulo 1 — Fundamentos de Liderança"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="session-date" className="text-xs">
            Data e hora <span className="text-destructive">*</span>
          </Label>
          <Input
            id="session-date"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="session-duration" className="text-xs">
            Duração (minutos)
          </Label>
          <Input
            id="session-duration"
            type="number"
            placeholder="Ex: 90"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="session-location" className="text-xs">
            Local
          </Label>
          <Input
            id="session-location"
            placeholder="Ex: Auditório principal / Online via Teams"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
        </div>
      </div>

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
          {loading ? "Salvando..." : "Salvar sessão"}
        </button>
      </div>
    </form>
  )
}
