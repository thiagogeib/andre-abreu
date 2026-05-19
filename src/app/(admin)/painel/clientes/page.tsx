import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Plus, Search, Building2, ExternalLink, Pencil } from "lucide-react"

export const metadata = { title: "Clientes" }

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const { q, page: pageParam } = await searchParams
  const search = q?.trim() ?? ""
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { legalName: { contains: search, mode: "insensitive" as const } },
          { cnpj: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        cnpj: true,
        segment: true,
        contactName: true,
        contactEmail: true,
        isActive: true,
        _count: {
          select: {
            programs: { where: { status: "ACTIVE" } },
          },
        },
      },
    }),
    prisma.company.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} {total === 1 ? "empresa cadastrada" : "empresas cadastradas"}
          </p>
        </div>
        <Link
          href="/painel/clientes/nova"
          className={cn(buttonVariants({ variant: "default" }), "gap-2 cursor-pointer")}
        >
          <Plus className="size-4" />
          Nova empresa
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          name="q"
          defaultValue={search}
          placeholder="Buscar por nome ou CNPJ..."
          className="h-8 w-full rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </form>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    CNPJ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Segmento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                    Contato
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Prog. ativos
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
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Building2 className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {search
                          ? "Nenhuma empresa encontrada para esta busca."
                          : "Nenhuma empresa cadastrada ainda."}
                      </p>
                      {!search && (
                        <Link
                          href="/painel/clientes/nova"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "mt-3 gap-1.5 cursor-pointer"
                          )}
                        >
                          <Plus className="size-3.5" />
                          Cadastrar primeira empresa
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr
                      key={company.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">
                          {company.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell font-mono text-xs">
                        {company.cnpj ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {company.segment ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        {company.contactName ? (
                          <div className="flex flex-col">
                            <span className="text-foreground text-xs">
                              {company.contactName}
                            </span>
                            {company.contactEmail && (
                              <span className="text-muted-foreground text-xs">
                                {company.contactEmail}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="font-medium text-foreground">
                          {company._count.programs}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={company.isActive ? "default" : "secondary"}
                          className={cn(
                            company.isActive
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : ""
                          )}
                        >
                          {company.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/painel/clientes/${company.id}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon-sm" }),
                              "cursor-pointer"
                            )}
                            aria-label={`Ver detalhes de ${company.name}`}
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                          <Link
                            href={`/painel/clientes/${company.id}/editar`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon-sm" }),
                              "cursor-pointer"
                            )}
                            aria-label={`Editar ${company.name}`}
                          >
                            <Pencil className="size-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Mostrando {skip + 1}–{Math.min(skip + pageSize, total)} de {total}
              </p>
              <div className="flex items-center gap-1">
                {page > 1 && (
                  <Link
                    href={`/painel/clientes?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(page - 1) })}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-pointer")}
                  >
                    Anterior
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/painel/clientes?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(page + 1) })}`}
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
