import type {
  Role,
  ProgramStatus,
  ProgramType,
  SessionStatus,
  MaterialType,
  LeadStatus,
  BlogPostStatus,
} from "@/generated/prisma"

export type UserPublic = {
  id: string
  name: string
  email: string
  role: Role
  phone: string | null
  isActive: boolean
  companyId: string | null
  createdAt: Date
}

export type CompanySummary = {
  id: string
  name: string
  cnpj: string | null
  segment: string | null
  contactName: string | null
  contactEmail: string | null
  isActive: boolean
  _count: { users: number; programs: number }
}

export type ProgramSummary = {
  id: string
  title: string
  type: ProgramType
  status: ProgramStatus
  startDate: Date | null
  endDate: Date | null
  company: { id: string; name: string }
  _count: { sessions: number; materials: number }
}

export type SessionDetail = {
  id: string
  title: string
  description: string | null
  status: SessionStatus
  scheduledAt: Date
  duration: number | null
  location: string | null
  summary: string | null
  attendees: number | null
}

export type MaterialItem = {
  id: string
  title: string
  description: string | null
  type: MaterialType
  url: string
  fileSize: number | null
  isPublic: boolean
  createdAt: Date
}

export type BlogPostCard = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverUrl: string | null
  tags: string[]
  publishedAt: Date | null
  status: BlogPostStatus
}

export type LeadItem = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  serviceType: string | null
  status: LeadStatus
  createdAt: Date
}

export type ApiResponse<T> = { data: T }

export type ApiListResponse<T> = {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type ApiError = {
  error: string
  details?: Record<string, string[]>
}

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  companyId: string | null
}
