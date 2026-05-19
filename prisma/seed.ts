import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash("admin123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "andre@andreabreuaviacao.com.br" },
    update: {},
    create: {
      name: "André Abreu",
      email: "andre@andreabreuaviacao.com.br",
      passwordHash: hash,
      role: "ADMIN",
    },
  })

  console.log("Admin criado:", admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
