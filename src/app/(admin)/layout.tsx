import { type ReactNode } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <AdminShell userName={session.user.name} userInitial={session.user.name?.[0] ?? "A"}>
      {children}
    </AdminShell>
  )
}
