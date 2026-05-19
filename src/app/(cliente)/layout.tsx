import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ClientShell } from "@/components/cliente/client-shell"

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== "CLIENT") redirect("/login")

  const companyName = session.user.companyId
    ? (await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { name: true },
      }))?.name ?? "Empresa"
    : "Empresa"

  return (
    <ClientShell
      userName={session.user.name}
      userInitial={session.user.name?.[0] ?? "C"}
      companyName={companyName}
    >
      {children}
    </ClientShell>
  )
}
