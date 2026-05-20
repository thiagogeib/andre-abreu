import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Admin ───────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "andre@andreabreuaviacao.com.br" },
    update: {},
    create: {
      name: "André Abreu",
      email: "andre@andreabreuaviacao.com.br",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  })
  console.log("✅ Admin:", admin.email, "/ senha: admin123")

  // ── Empresa de teste ────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { cnpj: "00.000.000/0001-00" },
    update: {},
    create: {
      name: "Empresa Teste S.A.",
      cnpj: "00.000.000/0001-00",
      segment: "Aviação",
      contactName: "João Silva",
      contactEmail: "joao@empresa-teste.com.br",
    },
  })
  console.log("✅ Empresa:", company.name)

  // ── Usuário cliente de teste ─────────────────────────────────────────
  const clientHash = await bcrypt.hash("cliente123", 12)
  const client = await prisma.user.upsert({
    where: { email: "cliente@empresa-teste.com.br" },
    update: {},
    create: {
      name: "João Silva",
      email: "cliente@empresa-teste.com.br",
      passwordHash: clientHash,
      role: "CLIENT",
      companyId: company.id,
    },
  })
  console.log("✅ Cliente:", client.email, "/ senha: cliente123")

  // ── Programa de teste ────────────────────────────────────────────────
  const program = await prisma.program.upsert({
    where: { id: "seed-program-01" },
    update: {},
    create: {
      id: "seed-program-01",
      title: "Liderança na Aviação — Turma 2026",
      description: "Programa de desenvolvimento de liderança baseado em metodologias da aviação.",
      type: "PROGRAMA",
      status: "ACTIVE",
      companyId: company.id,
      objectives: "Desenvolver habilidades de comunicação, tomada de decisão sob pressão e gestão de crises.",
      audience: "Gestores e líderes de equipe",
    },
  })
  console.log("✅ Programa:", program.title)

  // ── Sessão de teste ──────────────────────────────────────────────────
  await prisma.programSession.upsert({
    where: { id: "seed-session-01" },
    update: {},
    create: {
      id: "seed-session-01",
      title: "Módulo 1 — Comunicação em Cockpit",
      programId: program.id,
      scheduledAt: new Date("2026-06-10T09:00:00"),
      duration: 120,
      location: "Sala 301 — Torre Norte",
      status: "SCHEDULED",
    },
  })
  console.log("✅ Sessão criada")

  // ── Material de teste ─────────────────────────────────────────────────
  await prisma.material.upsert({
    where: { id: "seed-material-01" },
    update: {},
    create: {
      id: "seed-material-01",
      title: "Apostila Módulo 1",
      type: "LINK",
      url: "https://example.com/apostila-modulo1.pdf",
      programId: program.id,
      isPublic: false,
    },
  })
  console.log("✅ Material criado")

  console.log("\n📋 Credenciais para teste:")
  console.log("  ADMIN  → andre@andreabreuaviacao.com.br  / admin123")
  console.log("  CLIENT → cliente@empresa-teste.com.br   / cliente123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
