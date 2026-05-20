import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  Users,
  Target,
  Clock,
  MapPin,
  FileText,
  Link2,
  Download,
  CheckCircle2,
  Circle,
  AlertCircle,
  PlayCircle,
} from "lucide-react"
import type { ProgramStatus, ProgramType, SessionStatus, MaterialType } from "@/generated/prisma"

const TYPE_LABELS: Record<ProgramType, string> = {
  PALESTRA: "Palestra",
  WORKSHOP: "Workshop",
  TREINAMENTO: "Treinamento",
  PROGRAMA: "Programa",
}

const STATUS_LABELS: Record<ProgramStatus, string> = {
  DRAFT: "Em preparação",
  ACTIVE: "Em andamento",
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

const SESSION_STATUS_ICONS: Record<SessionStatus, typeof CheckCircle2> = {
  SCHEDULED: Circle,
  COMPLETED: CheckCircle2,
  CANCELLED: AlertCircle,
  RESCHEDULED: Circle,
}

const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  SCHEDULED: "text-muted-foreground",
  COMPLETED: "text-emerald-500",
  CANCELLED: "text-destructive",
  RESCHEDULED: "text-yellow-500",
}

const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  RESCHEDULED: "Reagendada",
}

const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  PDF: "PDF",
  IMAGE: "Imagem",
  LINK: "Link",
  VIDEO_URL: "Vídeo",
  PRESENTATION: "Apresentação",
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
      let videoId: string | null = null
      if (u.hostname === "youtu.be") {
        videoId = u.pathname.slice(1).split("?")[0]
      } else if (u.pathname === "/watch") {
        videoId = u.searchParams.get("v")
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.slice(7)
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const match = u.pathname.match(/\/(\d+)/)
      if (match) return `https://player.vimeo.com/video/${match[1]}`
    }
  } catch {
    // URL inválida
  }
  return null
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
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

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClienteProgramaDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session || session.user.role !== "CLIENT") redirect("/login")
  if (!session.user.companyId) redirect("/area/dashboard")

  const { id } = await params

  const program = await prisma.program.findFirst({
    where: { id, companyId: session.user.companyId },
    include: {
      sessions: { orderBy: { scheduledAt: "asc" } },
      materials: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!program) notFound()

  const now = new Date()
  const upcomingSessions = program.sessions.filter(
    (s) => s.scheduledAt >= now && s.status === "SCHEDULED"
  )
  const pastSessions = program.sessions.filter(
    (s) => s.scheduledAt < now || s.status !== "SCHEDULED"
  )

  const videos = program.materials.filter((m) => m.type === "VIDEO_URL")
  const otherMaterials = program.materials.filter((m) => m.type !== "VIDEO_URL")

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/area/programas"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "cursor-pointer mt-0.5 shrink-0"
          )}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{program.title}</h1>
            <Badge variant="secondary" className="text-[11px]">{TYPE_LABELS[program.type]}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="outline" className={cn("text-[11px]", STATUS_COLORS[program.status])}>
              {STATUS_LABELS[program.status]}
            </Badge>
            {program.status === "COMPLETED" && (
              <Link
                href={`/area/programas/${program.id}/certificado`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-6 text-[11px] gap-1 cursor-pointer text-blue-600 border-blue-200 hover:bg-blue-50")}
              >
                <Award className="size-3" />
                Ver Certificado
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Datas */}
      {(program.startDate || program.endDate) && (
        <div className="flex flex-wrap gap-3">
          {program.startDate && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Calendar className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Início</p>
                <p className="text-sm font-medium">{formatDateShort(program.startDate)}</p>
              </div>
            </div>
          )}
          {program.endDate && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Calendar className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Término previsto</p>
                <p className="text-sm font-medium">{formatDateShort(program.endDate)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sobre o programa */}
      {(program.description || program.objectives || program.audience) && (
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium">Sobre o programa</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {program.description && (
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {program.description}
              </p>
            )}
            {program.objectives && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Target className="size-3.5" /> Objetivos
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{program.objectives}</p>
              </div>
            )}
            {program.audience && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="size-3.5" /> Público-alvo
                </p>
                <p className="text-sm text-foreground">{program.audience}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Vídeos ── */}
      {videos.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PlayCircle className="size-4 text-muted-foreground" />
              Vídeos
              <Badge variant="secondary" className="text-[10px]">{videos.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            {videos.map((mat) => {
              const embedUrl = getEmbedUrl(mat.url)
              return (
                <div key={mat.id} className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{mat.title}</p>
                  {mat.description && (
                    <p className="text-xs text-muted-foreground">{mat.description}</p>
                  )}
                  {embedUrl ? (
                    <div className="rounded-lg overflow-hidden border border-border bg-black">
                      <iframe
                        src={embedUrl}
                        title={mat.title}
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Link2 className="size-3.5" />
                      Assistir vídeo
                    </a>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* ── Materiais ── */}
      {otherMaterials.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              Materiais
              <Badge variant="secondary" className="text-[10px]">{otherMaterials.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {otherMaterials.map((mat) => {
                const isDownloadable = mat.type === "PDF" || mat.type === "IMAGE" || mat.type === "PRESENTATION"
                return (
                  <a
                    key={mat.id}
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
                  >
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "var(--brand-navy)" }}
                    >
                      <FileText className="size-4" style={{ color: "var(--brand-gold)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-[var(--brand-gold)] transition-colors">
                        {mat.title}
                      </p>
                      {mat.description && (
                        <p className="text-xs text-muted-foreground truncate">{mat.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">
                        {MATERIAL_TYPE_LABELS[mat.type]}
                      </Badge>
                      {isDownloadable ? (
                        <Download className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      ) : (
                        <Link2 className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximas sessões */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            Próximas sessões
            {upcomingSessions.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{upcomingSessions.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma sessão agendada.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {upcomingSessions.map((s) => {
                const Icon = SESSION_STATUS_ICONS[s.status]
                return (
                  <div key={s.id} className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Icon className={cn("size-4 mt-0.5 shrink-0", SESSION_STATUS_COLORS[s.status])} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{s.title}</p>
                        {s.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {formatDateTime(s.scheduledAt)}
                          </span>
                          {s.duration && (
                            <span className="text-xs text-muted-foreground">· {s.duration} min</span>
                          )}
                        </div>
                        {s.location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="size-3" />
                            {s.location}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className={cn("shrink-0 text-[10px]")}>
                        {SESSION_STATUS_LABELS[s.status]}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de sessões */}
      {pastSessions.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Histórico de sessões ({pastSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {pastSessions.map((s) => {
                const Icon = SESSION_STATUS_ICONS[s.status]
                return (
                  <div key={s.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Icon className={cn("size-4 mt-0.5 shrink-0", SESSION_STATUS_COLORS[s.status])} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium">{s.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(s.scheduledAt)}
                        </span>
                        {s.summary && (
                          <p className="text-xs text-muted-foreground mt-1.5 border-l-2 border-border pl-2">
                            {s.summary}
                          </p>
                        )}
                        {s.attendees != null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <Users className="inline size-3 mr-1" />
                            {s.attendees} participantes
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 text-[10px]", {
                          "bg-emerald-500/10 text-emerald-600 border-emerald-500/20": s.status === "COMPLETED",
                          "bg-destructive/10 text-destructive border-destructive/20": s.status === "CANCELLED",
                        })}
                      >
                        {SESSION_STATUS_LABELS[s.status]}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
