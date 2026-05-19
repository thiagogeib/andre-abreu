import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Users,
  Target,
  CalendarClock,
  BookOpen,
  FileText,
} from "lucide-react"
import type { ProgramStatus, ProgramType, SessionStatus } from "@/generated/prisma"
import { ProgramStatusSelect } from "./program-status-select"
import { AddSessionForm } from "./add-session-form"
import { SessionItem } from "./session-item"
import { MaterialsSection } from "./materials-section"

const TYPE_LABELS: Record<ProgramType, string> = {
  PALESTRA: "Palestra",
  WORKSHOP: "Workshop",
  TREINAMENTO: "Treinamento",
  PROGRAMA: "Programa",
}

const STATUS_LABELS: Record<ProgramStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

const STATUS_COLORS: Record<ProgramStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
}

const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  RESCHEDULED: "Reagendada",
}

const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  SCHEDULED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  RESCHEDULED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
}

function formatDate(date: Date | null) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProgramaDetailPage({ params }: PageProps) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const { id } = await params
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      sessions: { orderBy: { scheduledAt: "asc" } },
      materials: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!program) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/painel/programas"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "cursor-pointer mt-0.5")}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{program.title}</h1>
            <Badge variant="secondary" className="text-[11px]">
              {TYPE_LABELS[program.type]}
            </Badge>
          </div>
          <Link
            href={`/painel/clientes/${program.company.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-0.5 w-fit"
          >
            <Building2 className="size-3.5" />
            {program.company.name}
          </Link>
        </div>
        <Badge variant="outline" className={cn("shrink-0", STATUS_COLORS[program.status])}>
          {STATUS_LABELS[program.status]}
        </Badge>
      </div>

      {/* Info cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {program.startDate && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3">
            <Calendar className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-[11px] text-muted-foreground">Início</p>
              <p className="text-sm font-medium">{formatDate(program.startDate)}</p>
            </div>
          </div>
        )}
        {program.endDate && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3">
            <Calendar className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-[11px] text-muted-foreground">Término</p>
              <p className="text-sm font-medium">{formatDate(program.endDate)}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3">
          <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-[11px] text-muted-foreground">Sessões</p>
            <p className="text-sm font-medium">{program.sessions.length}</p>
          </div>
        </div>
      </div>

      {/* Descrição / Objetivos / Público */}
      {(program.description || program.objectives || program.audience) && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            {program.description && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Descrição
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{program.description}</p>
              </div>
            )}
            {program.objectives && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Target className="size-3.5" /> Objetivos
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{program.objectives}</p>
              </div>
            )}
            {program.audience && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Users className="size-3.5" /> Público-alvo
                </p>
                <p className="text-sm text-foreground">{program.audience}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alterar status */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-medium">Status do programa</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ProgramStatusSelect programId={program.id} currentStatus={program.status} />
        </CardContent>
      </Card>

      {/* Sessões */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Sessões ({program.sessions.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {program.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma sessão agendada ainda.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {program.sessions.map((s) => (
                <SessionItem
                  key={s.id}
                  session={{
                    id: s.id,
                    title: s.title,
                    description: s.description,
                    status: s.status,
                    scheduledAt: s.scheduledAt.toISOString(),
                    duration: s.duration,
                    location: s.location,
                    attendees: s.attendees,
                    summary: s.summary,
                  }}
                  programId={program.id}
                  statusLabels={SESSION_STATUS_LABELS}
                  statusColors={SESSION_STATUS_COLORS}
                  formatDateTime={formatDateTime}
                />
              ))}
            </div>
          )}

          <Separator />
          <div className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Adicionar sessão
            </p>
            <AddSessionForm programId={program.id} />
          </div>
        </CardContent>
      </Card>

      {/* Materiais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Materiais ({program.materials.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <MaterialsSection
            programId={program.id}
            materials={program.materials.map((m) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              type: m.type,
              url: m.url,
              fileSize: m.fileSize,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
