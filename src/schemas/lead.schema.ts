import { z } from "zod"

export const leadSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobRole: z.string().optional(),
  message: z.string().min(10, "Mensagem muito curta"),
  serviceType: z.enum(["palestra", "workshop", "treinamento", "programa"]).optional(),
})

export type LeadInput = z.infer<typeof leadSchema>
