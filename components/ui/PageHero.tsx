import Link from "next/link"
import { ReactNode } from "react"

type Crumb = { label: string; href?: string }

export function PageHero({
  eyebrow,
  title,
  highlight,
  subtitle,
  breadcrumbs,
  children,
}: {
  eyebrow?: string
  title: string
  highlight?: string
  subtitle?: string
  breadcrumbs?: Crumb[]
  children?: ReactNode
}) {
  return (
    <section
      className="relative pt-24 sm:pt-28 md:pt-32 pb-10 md:pb-12 overflow-hidden text-white"
      style={{ background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)" }}
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4" />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)", backgroundSize: "26px 26px" }} />

      <div className="container relative z-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex flex-wrap items-center gap-2 text-white/60 text-sm mb-4 font-medium">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white transition-colors">{crumb.label}</Link>
                ) : (
                  <span className="text-white font-semibold">{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <span className="text-white/30">/</span>}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && <span className="section-eyebrow mb-3 block !text-amber-300">{eyebrow}</span>}

        <h1 className="text-3xl md:text-5xl font-black outfit leading-[1.05] tracking-tight mb-3 max-w-3xl">
          {title}{highlight && <> <span className="text-amber-300">{highlight}</span></>}
        </h1>

        {subtitle && (
          <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed font-medium">{subtitle}</p>
        )}

        {children}
      </div>
    </section>
  )
}
