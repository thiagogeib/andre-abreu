"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { ProgramStatus } from "@/generated/prisma"

const OPTIONS: { value: ProgramStatus; label: string }[] = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "PAUSED", label: "Pausado" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELLED", label: "Cancelado" },
]

interface Props {
  programId: string
  currentStatus: ProgramStatus
}

export function ProgramStatusSelect({ programId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<ProgramStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(newStatus: ProgramStatus) {
    if (newStatus === status || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/programs/${programId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setStatus(newStatus)
      toast.success("Status atualizado")
      router.refresh()
    } catch {
      toast.error("Erro ao atualizar status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          disabled={loading}
          onClick={() => handleChange(value)}
          className={
            value === status
              ? "px-3 py-1.5 rounded-lg text-sm font-semibold border-2 border-[var(--brand-gold)] bg-[var(--brand-gold)]/10 text-foreground cursor-default"
              : "px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}
