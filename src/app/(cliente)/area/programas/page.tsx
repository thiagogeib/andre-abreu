import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BookOpen, ArrowRight, Calendar, FileText } from "lucide-react"
import type { ProgramStatus, ProgramType } from "@/generated/prisma"

export const metadata = { title: "Meus Programas" }

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

function formatDateShort(date: Date | null) {
  if (!date) return null
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default async function ClienteProgramasPage() {
  const session = await auth()
  if (!session || session.user.role !== "CLIENT") redirect("/login")

  if (!session.user.companyId) redirect("/area/dashboard")

  const programs = await prisma.program.findMany({
    where: {
      companyId: session.user.companyId,
      status: { notIn: ["CANCELLED"] },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      status: true,
      startDate: true,
      endDate: true,
      audience: true,
      _count: { select: { sessions: true, materials: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Meus Programas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {programs.length} {programs.length === 1 ? "programa" : "programas"} contratados
        </p>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum programa cadastrado ainda.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Entre em contato com André Abreu para contratar um programa.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((prog) => (
            <Link
              key={prog.id}
              href={`/area/programas/${prog.id}`}
              className="group block rounded-xl border border-border bg-card hover:border-[var(--brand-gold)]/40 hover:shadow-sm transition-all"
            >
              <div className="p-5 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--brand-navy)" }}
                  >
                    <BookOpen className="size-5" style={{ color: "var(--brand-gold)" }} />
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] shrink-0", STATUS_COLORS[prog.status])}
                  >
                    {STATUS_LABELS[prog.status]}
                  </Badge>
                </div>

                {/* Título e tipo */}
                <div>
                  <p className="font-semibold text-foreground group-hover:text-[var(--brand-gold)] transition-colors">
                    {prog.title}
                  </p>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    {TYPE_LABELS[prog.type]}
                  </Badge>
                </div>

                {/* Descrição */}
                {prog.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{prog.description}</p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-border">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <BookOpen className="size-3" />
                    {prog._count.sessions} {prog._count.sessions === 1 ? "sessão" : "sessões"}
                  </span>
                  {prog._count.materials > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <FileText className="size-3" />
                      {prog._count.materials} {prog._count.materials === 1 ? "material" : "materiais"}
                    </span>
                  )}
                  {prog.startDate && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="size-3" />
                      {formatDateShort(prog.startDate)}
                      {prog.endDate ? ` → ${formatDateShort(prog.endDate)}` : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end px-5 py-2.5 border-t border-border bg-muted/20 rounded-b-xl">
                <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Ver detalhes
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
