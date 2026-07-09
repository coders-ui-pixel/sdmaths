import { Header } from "@/components/Header"
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { SITE_NAME, SITE_URL } from "@/lib/site"
import { PageHero } from "@/components/ui/PageHero"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Blog",
  description: "Read the latest articles, updates, and mathematical insights.",
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      
      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        eyebrow="Insights & Articles"
        title="Our"
        highlight="Blog"
        subtitle="Insights, updates, and deep dives into the beautiful world of mathematics."
      />

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {posts.length === 0 ? (
            <div className="py-24 text-center max-w-md mx-auto border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40 p-8 shadow-sm">
              <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">No Articles Available Yet</p>
              <p className="text-xs text-slate-400 leading-relaxed">Our faculty is currently writing insightful mathematical guides. Check back shortly for our upcoming publications!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => (
                <div key={post.id} className="card group cursor-pointer overflow-hidden p-0 flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:shadow-xl transition-all rounded-3xl">
                  <div className="h-48 bg-slate-200 dark:bg-slate-800 w-full relative overflow-hidden">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        <span className="outfit font-bold opacity-30 text-slate-400 text-sm">{SITE_NAME}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-3">
                        <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><User size={14}/> {post.authorName}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100 group-hover:text-[var(--primary)] transition-colors outfit leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">
                        {post.summary}
                      </p>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-[var(--primary)] font-bold text-sm hover:underline mt-auto">
                      Read Article <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
