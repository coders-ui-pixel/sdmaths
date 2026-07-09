"use client"

import { usePathname } from "next/navigation"

/** Decorative dot-grid + glow behind the learn portal's main content — skipped on
 * the notes reading pages, which want a plain background for distraction-free reading. */
export function LearnBackgroundTexture() {
  const pathname = usePathname()
  if (pathname.includes("/learn/notes")) return null

  return (
    <>
      <div
        className="absolute inset-0 -z-0 opacity-[0.4] dark:opacity-[0.15] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(var(--primary) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "linear-gradient(to bottom, black, transparent 60%)" }}
      />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--primary)]/[0.06] blur-[100px] rounded-full -z-0 pointer-events-none" />
    </>
  )
}
