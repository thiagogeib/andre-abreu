import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  CalendarClock,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react"
import type { ProgramStatus, ProgramType, SessionStatus } from "@/generated/prisma"

export const metadata = { title: "Dashboard" }

const TYPE_LABELS: Record<ProgramType, string> = {
  PALESTRA: "Palestra",
  WORKSHOP: "Workshop",
  TREINAMENTO: "Treinamento",
  PROGRAMA: "Programa",
}

const PROG_STATUS_COLORS: Record<ProgramStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
}

const PROG_STATUS_LABELS: Record<ProgramStatus, string> = {
  DRAFT: "Em preparação",
  ACTIVE: "Em andamento",
  PAUSED: "Pausado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  RESCHEDULED: "Reagendada",
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatDateShort(date: Date | null) {
  if (!date) return null
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default async function ClienteDashboardPage() {
  const session = await auth()
  if (!session || session.user.role !== "CLIENT") redirect("/login")

  if (!session.user.companyId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Sua conta ainda não está vinculada a uma empresa.
          </p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Entre em contato com André Abreu para regularização.
          </p>
        </div>
      </div>
    )
  }

  const now = new Date()

  const [programs, upcomingSessions, company] = await Promise.all([
    prisma.program.findMany({
      where: {
        companyId: session.user.companyId,
        status: { notIn: ["CANCELLED"] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        _count: { select: { sessions: true, materials: true } },
      },
    }),
    prisma.programSession.findMany({
      where: {
        scheduledAt: { gte: now },
        status: "SCHEDULED",
        program: { companyId: session.user.companyId },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        duration: true,
        location: true,
        status: true,
        program: { select: { id: true, title: true } },
      },
    }),
    prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { name: true },
    }),
  ])

  const activePrograms = programs.filter((p) => p.status === "ACTIVE")
  const otherPrograms = programs.filter((p) => p.status !== "ACTIVE")

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Olá, {session.user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {company?.name} · Área do cliente
        </p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-foreground">{activePrograms.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activePrograms.length === 1 ? "Programa ativo" : "Programas ativos"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-foreground">{upcomingSessions.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {upcomingSessions.length === 1 ? "Próxima sessão" : "Próximas sessões"}
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold text-foreground">{programs.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {programs.length === 1 ? "Programa total" : "Programas no total"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Programas ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Programas ativos</CardTitle>
            </div>
            <Link
              href="/area/programas"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs cursor-pointer")}
            >
              Ver todos
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {activePrograms.length === 0 ? (
              <div className="py-8 text-center">
                <Circle className="mx-auto size-7 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum programa ativo no momento.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activePrograms.map((prog) => (
                  <Link
                    key={prog.id}
                    href={`/area/programas/${prog.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
                  >
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "var(--brand-navy)" }}
                    >
                      <BookOpen className="size-4" style={{ color: "var(--brand-gold)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate group-hover:text-[var(--brand-gold)] transition-colors">
                        {prog.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {TYPE_LABELS[prog.type]}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {prog._count.sessions} {prog._count.sessions === 1 ? "sessão" : "sessões"}
                        </span>
                        {prog._count.materials > 0 && (
                          <span className="text-[11px] text-muted-foreground">
                            · {prog._count.materials} {prog._count.materials === 1 ? "material" : "materiais"}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                  </Link>
                ))}
              </div>
            )}

            {otherPrograms.length > 0 && (
              <>
                <div className="px-4 py-2 border-t border-border bg-muted/20">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Outros programas
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {otherPrograms.slice(0, 3).map((prog) => (
                    <Link
                      key={prog.id}
                      href={`/area/programas/${prog.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">{prog.title}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] shrink-0", PROG_STATUS_COLORS[prog.status])}
                      >
                        {PROG_STATUS_LABELS[prog.status]}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Próximas sessões */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Próximas sessões</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingSessions.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto size-7 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma sessão agendada.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {upcomingSessions.map((s) => (
                  <div key={s.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5"
                        style={{ background: "var(--brand-navy)" }}
                      >
                        <CalendarClock className="size-4" style={{ color: "var(--brand-gold)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {s.program.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="size-3" />
                            {formatDateTime(s.scheduledAt)}
                            {s.duration ? ` · ${s.duration}min` : ""}
                          </span>
                          {s.location && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <MapPin className="size-3" />
                              {s.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
