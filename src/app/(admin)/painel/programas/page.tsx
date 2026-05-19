import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus, BookOpen, ExternalLink, Building2 } from "lucide-react"
import type { ProgramStatus, ProgramType } from "@/generated/prisma"

export const metadata = { title: "Programas" }

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

const FILTER_TABS: { label: string; value: ProgramStatus | "ALL" }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Ativos", value: "ACTIVE" },
  { label: "Rascunhos", value: "DRAFT" },
  { label: "Pausados", value: "PAUSED" },
  { label: "Concluídos", value: "COMPLETED" },
]

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

function formatDateShort(date: Date | null) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default async function ProgramasPage({ searchParams }: PageProps) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const { status: statusParam, page: pageParam } = await searchParams
  const validStatuses: ProgramStatus[] = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]
  const status = validStatuses.includes(statusParam as ProgramStatus)
    ? (statusParam as ProgramStatus)
    : null
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where = status ? { status } : {}

  const [programs, total, counts] = await Promise.all([
    prisma.program.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        company: { select: { id: true, name: true } },
        _count: { select: { sessions: true, materials: true } },
      },
    }),
    prisma.program.count({ where }),
    prisma.program.groupBy({ by: ["status"], _count: { status: true } }),
  ])

  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count.status])
  ) as Partial<Record<ProgramStatus, number>>

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Programas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} {total === 1 ? "programa cadastrado" : "programas cadastrados"}
          </p>
        </div>
        <Link
          href="/painel/programas/novo"
          className={cn(buttonVariants({ variant: "default" }), "gap-2 cursor-pointer")}
        >
          <Plus className="size-4" />
          Novo programa
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(({ label, value }) => {
          const isActive = (value === "ALL" && !status) || value === status
          const count =
            value === "ALL"
              ? total
              : (countByStatus[value as ProgramStatus] ?? 0)
          const href =
            value === "ALL" ? "/painel/programas" : `/painel/programas?status=${value}`
          return (
            <Link
              key={value}
              href={href}
              className={cn(
                buttonVariants({ variant: isActive ? "default" : "outline", size: "sm" }),
                "gap-1.5 cursor-pointer"
              )}
            >
              {label}
              <span
                className={cn(
                  "text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-white/20" : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Programa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                    Período
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Sessões
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {programs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <BookOpen className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {status ? "Nenhum programa com este status." : "Nenhum programa cadastrado ainda."}
                      </p>
                      {!status && (
                        <Link
                          href="/painel/programas/novo"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "mt-3 gap-1.5 cursor-pointer"
                          )}
                        >
                          <Plus className="size-3.5" />
                          Criar primeiro programa
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  programs.map((program) => (
                    <tr key={program.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{program.title}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Link
                          href={`/painel/clientes/${program.company.id}`}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Building2 className="size-3.5 shrink-0" />
                          {program.company.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge variant="secondary" className="text-[11px]">
                          {TYPE_LABELS[program.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
                        {formatDateShort(program.startDate)}
                        {program.startDate && program.endDate && " → "}
                        {program.endDate && formatDateShort(program.endDate)}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="font-medium text-foreground">{program._count.sessions}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={STATUS_COLORS[program.status]}>
                          {STATUS_LABELS[program.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <Link
                            href={`/painel/programas/${program.id}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon-sm" }),
                              "cursor-pointer"
                            )}
                            aria-label={`Ver programa ${program.title}`}
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Mostrando {skip + 1}–{Math.min(skip + pageSize, total)} de {total}
              </p>
              <div className="flex items-center gap-1">
                {page > 1 && (
                  <Link
                    href={`/painel/programas?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page - 1) })}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-pointer")}
                  >
                    Anterior
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/painel/programas?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page + 1) })}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-pointer")}
                  >
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
