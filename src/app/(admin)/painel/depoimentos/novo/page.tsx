import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DepoimentoForm } from "../depoimento-form"

export const metadata = { title: "Novo depoimento" }

export default async function NovoDepoimentoPage() {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/painel/depoimentos"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "cursor-pointer")}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Novo depoimento</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Adicionar depoimento de cliente</p>
        </div>
      </div>

      <DepoimentoForm />
    </div>
  )
}
