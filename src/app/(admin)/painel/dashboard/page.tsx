import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  BookOpen,
  Users,
  CalendarClock,
  ArrowRight,
  Clock,
  MapPin,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LeadStatus, SessionStatus } from "@/generated/prisma"

export const metadata = { title: "Dashboard" }

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const leadStatusLabel: Record<LeadStatus, string> = {
  NEW: "Novo",
  READ: "Lido",
  REPLIED: "Respondido",
  ARCHIVED: "Arquivado",
}

const leadStatusVariant: Record<LeadStatus, "default" | "secondary" | "outline" | "destructive"> = {
  NEW: "default",
  READ: "secondary",
  REPLIED: "outline",
  ARCHIVED: "outline",
}

const sessionStatusLabel: Record<SessionStatus, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  RESCHEDULED: "Reagendada",
}

export default async function DashboardPage() {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  const [
    totalCompanies,
    activePrograms,
    newLeads,
    weeklySessions,
    recentLeads,
    upcomingSessions,
  ] = await Promise.all([
    prisma.company.count({ where: { isActive: true } }),
    prisma.program.count({ where: { status: "ACTIVE" } }),
    prisma.contactLead.count({
      where: { createdAt: { gte: yesterday } },
    }),
    prisma.programSession.count({
      where: {
        scheduledAt: { gte: startOfWeek, lt: endOfWeek },
        status: { in: ["SCHEDULED", "COMPLETED"] },
      },
    }),
    prisma.contactLead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        company: true,
        serviceType: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.programSession.findMany({
      where: {
        scheduledAt: { gte: now },
        status: "SCHEDULED",
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        location: true,
        duration: true,
        program: {
          select: {
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    }),
  ])

  const metrics = [
    {
      label: "Total de Clientes",
      value: totalCompanies,
      icon: Building2,
      description: "Empresas ativas",
    },
    {
      label: "Programas Ativos",
      value: activePrograms,
      icon: BookOpen,
      description: "Em andamento",
    },
    {
      label: "Novos Leads",
      value: newLeads,
      icon: Users,
      description: "Últimas 24 horas",
    },
    {
      label: "Sessões esta semana",
      value: weeklySessions,
      icon: CalendarClock,
      description: "Agendadas ou concluídas",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Visão geral da plataforma
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, description }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <div
                className="flex size-8 items-center justify-center rounded-lg"
                style={{ background: "var(--brand-navy)", color: "var(--brand-gold)" }}
              >
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Leads recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
            <CardTitle className="text-sm font-medium">Leads recentes</CardTitle>
            <Link
              href="/painel/leads"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-1 text-xs"
              )}
            >
              Ver todos
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum lead encontrado.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {lead.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {lead.company && (
                          <span className="truncate text-xs text-muted-foreground">
                            {lead.company}
                          </span>
                        )}
                        {lead.serviceType && (
                          <>
                            <span className="text-muted-foreground/40 text-xs">·</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {lead.serviceType}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={leadStatusVariant[lead.status]}>
                        {leadStatusLabel[lead.status]}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas sessões */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
            <CardTitle className="text-sm font-medium">Próximas sessões</CardTitle>
            <Link
              href="/painel/programas"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-1 text-xs"
              )}
            >
              Ver programas
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma sessão agendada.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {upcomingSessions.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 px-4 py-3">
                    <div
                      className="flex size-8 shrink-0 flex-col items-center justify-center rounded-lg text-center"
                      style={{ background: "var(--brand-navy)" }}
                    >
                      <CalendarClock className="size-4" style={{ color: "var(--brand-gold)" }} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {s.title}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {s.program.company.name} · {s.program.title}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="size-3" />
                          {formatDateShort(s.scheduledAt)}
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
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {sessionStatusLabel["SCHEDULED"]}
                    </Badge>
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
