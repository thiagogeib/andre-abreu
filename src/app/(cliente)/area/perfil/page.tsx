import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ChangePasswordForm } from "./change-password-form"

export const metadata = { title: "Meu Perfil" }

export default async function PerfilPage() {
  const session = await auth()
  if (!session || session.user.role !== "CLIENT") redirect("/login")

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie suas informações de acesso</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conta</p>
        <p className="text-sm font-medium text-foreground">{session.user.name}</p>
        <p className="text-sm text-muted-foreground">{session.user.email}</p>
      </div>

      <ChangePasswordForm />
    </div>
  )
}
