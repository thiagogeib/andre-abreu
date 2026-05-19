import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "André Abreu | Treinamentos Corporativos — Aviação",
    template: "%s | André Abreu",
  },
  description:
    "27 anos de experiência na aviação transformados em treinamentos corporativos de alto impacto. Palestras, workshops e programas personalizados sobre liderança, comunicação e performance humana.",
  keywords: [
    "treinamento corporativo",
    "aviação",
    "liderança",
    "fator humano",
    "comunicação",
    "gestão de crise",
    "performance humana",
    "palestra corporativa",
    "workshop",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "André Abreu — Aviação Corporativa",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
