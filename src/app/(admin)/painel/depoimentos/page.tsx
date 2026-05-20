import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageSquareQuote, Plus, Pencil } from "lucide-react"
import { TestimonialDeleteButton } from "./testimonial-delete-button"

export const metadata = { title: "Depoimentos" }

export default async function DepoimentosPage() {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Depoimentos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {testimonials.length} {testimonials.length === 1 ? "depoimento" : "depoimentos"}
          </p>
        </div>
        <Link
          href="/painel/depoimentos/novo"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5 cursor-pointer")}
        >
          <Plus className="size-4" />
          Novo depoimento
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Depoimento
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Publicado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Ordem
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {testimonials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <MessageSquareQuote className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhum depoimento cadastrado.</p>
                      <Link
                        href="/painel/depoimentos/novo"
                        className={cn(buttonVariants({ size: "sm" }), "mt-3 gap-1.5 cursor-pointer")}
                      >
                        <Plus className="size-4" />
                        Adicionar depoimento
                      </Link>
                    </td>
                  </tr>
                ) : (
                  testimonials.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{t.authorName}</span>
                          {(t.authorRole || t.company) && (
                            <span className="text-xs text-muted-foreground">
                              {[t.authorRole, t.company].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                          {t.content}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={
                            t.isPublished
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {t.isPublished ? "Sim" : "Não"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell text-sm text-muted-foreground">
                        {t.order}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/painel/depoimentos/${t.id}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon-sm" }),
                              "cursor-pointer"
                            )}
                            aria-label="Editar depoimento"
                          >
                            <Pencil className="size-3.5" />
                          </Link>
                          <TestimonialDeleteButton id={t.id} authorName={t.authorName} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
