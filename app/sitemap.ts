import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL

  // Fetch all courses and published blog posts for dynamic URLs
  const [courses, posts] = await Promise.all([
    prisma.course.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
  ])

  const courseUrls = courses.map((course: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const blogUrls = posts.map((post: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const staticUrls = [
    { path: '', changeFrequency: 'daily' as const, priority: 1 },
    { path: '/courses', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/notes', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/blog', changeFrequency: 'daily' as const, priority: 0.7 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/refund', changeFrequency: 'yearly' as const, priority: 0.3 },
  ].map((s) => ({
    url: `${baseUrl}${s.path}`,
    lastModified: new Date(),
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }))

  return [...staticUrls, ...courseUrls, ...blogUrls]
}
