"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, Plane } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/#servicos", label: "Serviços" },
  { href: "/#temas", label: "Temas" },
  { href: "/#sobre", label: "Sobre André" },
  { href: "/blog", label: "Blog" },
]

const GOLD = "oklch(0.74 0.14 81)"
const NAVY_DEEP = "oklch(0.18 0.05 248)"

function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.30_0.075_248/95%)] backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Plane className="w-5 h-5 -rotate-45" style={{ color: GOLD }} />
          <span className="font-semibold text-white tracking-wide text-sm">André Abreu</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/70 hover:text-white text-sm transition-colors duration-200 cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-white/60 hover:text-white text-sm font-medium transition-colors cursor-pointer px-3 py-1.5"
          >
            Entrar
          </Link>
          <Link
            href="/#contato"
            className="inline-flex items-center px-5 h-9 rounded-full text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: GOLD, color: NAVY_DEEP }}
          >
            Quero um Treinamento
          </Link>
        </div>

        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-white cursor-pointer" />}>
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-[oklch(0.18_0.05_248)] border-white/10 text-white"
          >
            <div className="flex flex-col gap-8 pt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/80 hover:text-white text-lg font-medium transition-colors cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4">
                <Link
                  href="/#contato"
                  className="inline-flex items-center justify-center h-11 rounded-full font-semibold cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: GOLD, color: NAVY_DEEP }}
                >
                  Quero um Treinamento
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-11 rounded-full font-semibold cursor-pointer border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
                >
                  Entrar
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-[oklch(0.15_0.04_248)] border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 -rotate-45" style={{ color: GOLD }} />
            <span className="text-white/80 text-sm font-medium">André Abreu</span>
            <span className="text-white/40 text-sm">— Aviação Corporativa</span>
          </div>
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/50 hover:text-white/80 text-xs transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} André Abreu. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
