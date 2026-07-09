import { Header } from "@/components/Header"
import { Calendar, User, ArrowLeft, BookOpen, Clock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SITE_NAME, SITE_URL } from "@/lib/site"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug }
  })

  if (!post) return { title: "Article Not Found" }

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
  }
}

export default async function BlogPostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug }
  })

  if (!post || !post.published) {
    return notFound()
  }

  // Simple reading time estimator (average 200 words per minute)
  const wordCount = post.content.split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.summary,
    "image": post.imageUrl || undefined,
    "datePublished": post.createdAt.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "author": { "@type": "Person", "name": post.authorName },
    "publisher": { "@type": "EducationalOrganization", "name": SITE_NAME },
    "mainEntityOfPage": `${SITE_URL}/blog/${post.slug}`,
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <Header />
      
      <div className="pt-32 container mx-auto px-6 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--primary)] font-bold mb-8 hover:underline group">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Blog
        </Link>

        <article className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-12 shadow-sm">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 mb-6">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><User size={14} /> By {post.authorName}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {readingTime} min read</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black outfit leading-tight text-slate-800 dark:text-slate-100 mb-6">
            {post.title}
          </h1>

          {/* Excerpt Summary */}
          <p className="text-slate-500 dark:text-slate-400 text-lg italic border-l-4 border-[var(--primary)] pl-6 py-1 mb-8 leading-relaxed">
            {post.summary}
          </p>

          {/* Cover Image */}
          {post.imageUrl && (
            <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-10 shadow-md">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Article Body Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {post.content.split("\n").map((para: string, i: number) => {
              const trimmed = para.trim()
              if (!trimmed) return <div key={i} className="h-4" />
              
              // Handle headers inside content if they start with '#'
              if (trimmed.startsWith("### ")) {
                return <h3 key={i} className="text-xl font-bold outfit text-slate-800 dark:text-slate-100 mt-8 mb-4">{trimmed.replace("### ", "")}</h3>
              }
              if (trimmed.startsWith("## ")) {
                return <h2 key={i} className="text-2xl font-black outfit text-slate-800 dark:text-slate-100 mt-10 mb-6">{trimmed.replace("## ", "")}</h2>
              }
              
              return (
                <p key={i} className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed mb-6 font-medium">
                  {trimmed}
                </p>
              )
            })}
          </div>
        </article>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    </main>
  )
}
