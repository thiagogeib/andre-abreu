"use client"

import { type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, BookOpen, Plane, LogOut, Menu, ChevronRight, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { label: "Dashboard", href: "/area/dashboard", icon: LayoutDashboard },
  { label: "Meus Programas", href: "/area/programas", icon: BookOpen },
  { label: "Meu Perfil", href: "/area/perfil", icon: UserRound },
]

interface NavProps {
  pathname: string
  onNavigate?: () => void
}

function Nav({ pathname, onNavigate }: NavProps) {
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--sidebar-accent)] text-[var(--brand-gold)]"
                : "text-[oklch(0.70_0.025_248)] hover:bg-[var(--sidebar-accent)] hover:text-[oklch(0.92_0.01_248)]"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{label}</span>
            {active && <ChevronRight className="ml-auto size-3.5 opacity-60" />}
          </Link>
        )
      })}
    </nav>
  )
}

interface ClientShellProps {
  children: ReactNode
  userName: string
  userInitial: string
  companyName: string
}

export function ClientShell({ children, userName, userInitial, companyName }: ClientShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.push("/login")
  }

  const activeLabel = navItems.find((i) => pathname.startsWith(i.href))?.label ?? "Área do Cliente"

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside
        className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50"
        style={{ background: "var(--sidebar)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ background: "var(--brand-gold)" }}
          >
            <Plane className="size-4 -rotate-45 text-[oklch(0.18_0.05_248)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[oklch(0.92_0.01_248)] leading-none">
              André Abreu
            </span>
            <span className="text-[10px] text-[oklch(0.55_0.025_248)] leading-none mt-0.5">
              Aviação Corporativa
            </span>
          </div>
        </div>

        <Separator className="bg-[var(--sidebar-border)] mx-3" />

        {/* Empresa */}
        <div className="px-6 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[oklch(0.45_0.025_248)]">
            Empresa
          </p>
          <p className="text-sm font-medium text-[oklch(0.85_0.02_248)] mt-0.5 truncate">
            {companyName}
          </p>
        </div>

        <Separator className="bg-[var(--sidebar-border)] mx-3" />

        <div className="flex flex-col gap-1 py-4 flex-1 overflow-y-auto">
          <p className="px-6 py-1 text-[10px] font-semibold uppercase tracking-widest text-[oklch(0.45_0.025_248)]">
            Menu
          </p>
          <Nav pathname={pathname} />
        </div>

        <Separator className="bg-[var(--sidebar-border)] mx-3" />
        <div className="p-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--sidebar-accent)]">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold)] text-[oklch(0.18_0.05_248)] text-xs font-bold uppercase">
              {userInitial}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-medium text-[oklch(0.92_0.01_248)]">
                {userName}
              </span>
              <Badge
                variant="outline"
                className="mt-0.5 w-fit border-[var(--brand-gold)]/40 text-[var(--brand-gold)] text-[10px] px-1.5 py-0 h-4"
              >
                CLIENTE
              </Badge>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sair da conta"
              className="ml-auto text-[oklch(0.50_0.025_248)] hover:text-[oklch(0.80_0.025_248)] transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6">
          {/* Hamburger mobile */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Abrir menu"
                  className="lg:hidden"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64" style={{ background: "var(--sidebar)" }}>
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de navegação</SheetTitle>
              </SheetHeader>
              <div className="flex items-center gap-2.5 px-6 py-5">
                <div
                  className="flex size-8 items-center justify-center rounded-lg"
                  style={{ background: "var(--brand-gold)" }}
                >
                  <Plane className="size-4 -rotate-45 text-[oklch(0.18_0.05_248)]" />
                </div>
                <span className="text-sm font-semibold text-[oklch(0.92_0.01_248)]">
                  André Abreu
                </span>
              </div>
              <Separator className="bg-[var(--sidebar-border)] mx-3" />
              <div className="py-4">
                <Nav pathname={pathname} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Área do Cliente</span>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground font-medium">{activeLabel}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-40">
              {companyName}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sair da conta"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "cursor-pointer")}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
