import { prisma } from "@/lib/prisma"
import { HomeClient } from "./home-client"

export const revalidate = 60

export default async function HomePage() {
  const [testimonials, blogPosts] = await Promise.all([
    prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      take: 3,
      select: { id: true, authorName: true, authorRole: true, company: true, content: true },
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, title: true, slug: true, excerpt: true, tags: true, publishedAt: true },
    }),
  ])

  return <HomeClient testimonials={testimonials} blogPosts={blogPosts} />
}
