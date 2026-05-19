import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/lib/auth"

const f = createUploadthing()

export const uploadRouter = {
  programMaterial: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 1 },
    image: { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.ms-powerpoint": { maxFileSize: "64MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      maxFileSize: "64MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth()
      if (!session || session.user.role !== "ADMIN") throw new Error("Não autorizado")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, key: file.key, name: file.name, size: file.size }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
