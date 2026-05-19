import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Users, ChevronRight } from "lucide-react"
import type { LeadStatus } from "@/generated/prisma"
import { LeadActions } from "./lead-actions"

export const metadata = { title: "Leads" }

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Novo",
  READ: "Lido",
  REPLIED: "Respondido",
  ARCHIVED: "Arquivado",
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  READ: "bg-muted text-muted-foreground",
  REPLIED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  ARCHIVED: "bg-muted text-muted-foreground/60",
}

const FILTER_TABS: { label: string; value: LeadStatus | "ALL" }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Novos", value: "NEW" },
  { label: "Lidos", value: "READ" },
  { label: "Respondidos", value: "REPLIED" },
  { label: "Arquivados", value: "ARCHIVED" },
]

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const { status: statusParam, page: pageParam } = await searchParams
  const validStatuses: LeadStatus[] = ["NEW", "READ", "REPLIED", "ARCHIVED"]
  const status = validStatuses.includes(statusParam as LeadStatus)
    ? (statusParam as LeadStatus)
    : null
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))
  const pageSize = 25
  const skip = (page - 1) * pageSize

  const where = status ? { status } : {}

  const [leads, total, counts] = await Promise.all([
    prisma.contactLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.contactLead.count({ where }),
    prisma.contactLead.groupBy({ by: ["status"], _count: { status: true } }),
  ])

  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count.status])
  ) as Partial<Record<LeadStatus, number>>

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {total} {total === 1 ? "mensagem recebida" : "mensagens recebidas"}
        </p>
      </div>

      {/* Filtros de status */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(({ label, value }) => {
          const isActive = (value === "ALL" && !status) || value === status
          const count =
            value === "ALL"
              ? total
              : (countByStatus[value as LeadStatus] ?? 0)
          const href =
            value === "ALL" ? "/painel/leads" : `/painel/leads?status=${value}`
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
                  isActive
                    ? "bg-white/20"
                    : "bg-muted text-muted-foreground"
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
                    Contato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Empresa / Cargo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Serviço
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                    Data
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
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Users className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {status ? "Nenhum lead com este status." : "Nenhum lead recebido ainda."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{lead.name}</span>
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {lead.email}
                          </a>
                          {lead.phone && (
                            <span className="text-xs text-muted-foreground">{lead.phone}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-col">
                          {lead.company && (
                            <span className="text-foreground text-sm">{lead.company}</span>
                          )}
                          {lead.jobRole && (
                            <span className="text-xs text-muted-foreground">{lead.jobRole}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-sm">
                        {lead.serviceType ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[lead.status]}
                        >
                          {STATUS_LABELS[lead.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/painel/leads/${lead.id}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon-sm" }),
                              "cursor-pointer"
                            )}
                            aria-label="Ver mensagem"
                          >
                            <ChevronRight className="size-3.5" />
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
                    href={`/painel/leads?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page - 1) })}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-pointer")}
                  >
                    Anterior
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/painel/leads?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page + 1) })}`}
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
