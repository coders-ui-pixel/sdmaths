import { prisma } from "@/lib/prisma"
import { SITE_NAME, SITE_URL } from "@/lib/site"
import { getBranding } from "@/lib/branding"

export const dynamic = "force-dynamic"

// A plain-text summary of the site for AI answer engines / LLM crawlers (AEO/GEO),
// following the emerging llms.txt convention (https://llmstxt.org/).
export async function GET() {
  const branding = await getBranding()

  const [courses, posts] = await Promise.all([
    prisma.course.findMany({
      select: { title: true, slug: true, description: true, price: true },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { title: true, slug: true, summary: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }).catch(() => []),
  ])

  const lines: string[] = []
  lines.push(`# ${SITE_NAME}`)
  lines.push("")
  lines.push(`> ${branding.heroSubtitle}`)
  lines.push("")
  lines.push(`${SITE_NAME} is an online mathematics learning platform based in Kathmandu, Nepal, offering live classes, HD video lectures, MCQ practice exams, and downloadable study notes for students.`)
  lines.push("")
  lines.push("## Courses")
  lines.push("")
  for (const c of courses) {
    const price = c.price === 0 ? "Free" : `Rs. ${c.price}`
    lines.push(`- [${c.title}](${SITE_URL}/courses/${c.slug}): ${c.description} (${price})`)
  }
  lines.push("")
  lines.push("## Key Pages")
  lines.push("")
  lines.push(`- [All Courses](${SITE_URL}/courses)`)
  lines.push(`- [Blog](${SITE_URL}/blog)`)
  lines.push(`- [About](${SITE_URL}/about)`)
  lines.push(`- [FAQ](${SITE_URL}/faq)`)

  if (posts.length > 0) {
    lines.push("")
    lines.push("## Recent Articles")
    lines.push("")
    for (const p of posts) {
      lines.push(`- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.summary}`)
    }
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
