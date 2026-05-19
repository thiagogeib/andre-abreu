"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Users, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import type { SessionStatus } from "@/generated/prisma"

interface SessionData {
  id: string
  title: string
  description: string | null
  status: SessionStatus
  scheduledAt: string
  duration: number | null
  location: string | null
  attendees: number | null
  summary: string | null
}

interface Props {
  session: SessionData
  programId: string
  statusLabels: Record<SessionStatus, string>
  statusColors: Record<SessionStatus, string>
  formatDateTime: (d: Date) => string
}

export function SessionItem({ session, programId, statusLabels, statusColors, formatDateTime }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [status, setStatus] = useState<SessionStatus>(session.status)
  const [updating, setUpdating] = useState(false)

  async function handleStatusChange(newStatus: SessionStatus) {
    if (newStatus === status || updating) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/v1/programs/${programId}/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setStatus(newStatus)
      toast.success("Status da sessão atualizado")
      router.refresh()
    } catch {
      toast.error("Erro ao atualizar sessão")
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete() {
    if (deleting) return
    if (!confirm(`Excluir sessão "${session.title}"?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/v1/programs/${programId}/sessions/${session.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success("Sessão excluída")
      router.refresh()
    } catch {
      toast.error("Erro ao excluir sessão")
    } finally {
      setDeleting(false)
    }
  }

  const SESSION_STATUS_OPTIONS: SessionStatus[] = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"]

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground">{session.title}</span>
            <Badge variant="outline" className={`text-[10px] ${statusColors[status]}`}>
              {statusLabels[status]}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {formatDateTime(new Date(session.scheduledAt))}
              {session.duration ? ` · ${session.duration}min` : ""}
            </span>
            {session.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {session.location}
              </span>
            )}
            {session.attendees != null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3" />
                {session.attendees} participantes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label={expanded ? "Recolher" : "Expandir"}
          >
            {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Excluir sessão"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 pl-0">
          {session.description && (
            <p className="text-xs text-muted-foreground">{session.description}</p>
          )}
          {session.summary && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Resumo
              </p>
              <p className="text-xs text-foreground whitespace-pre-wrap">{session.summary}</p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Alterar status
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SESSION_STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusChange(s)}
                  className={
                    s === status
                      ? "px-2.5 py-1 rounded-md text-xs font-semibold border-2 border-[var(--brand-gold)] bg-[var(--brand-gold)]/10 cursor-default"
                      : "px-2.5 py-1 rounded-md text-xs text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                  }
                >
                  {statusLabels[s] ?? s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
