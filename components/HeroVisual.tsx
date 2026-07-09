"use client"

import { useState } from "react"
import { PlayCircle, Star, CheckCircle2 } from "lucide-react"

const HERO_IMAGE_SRC = "/images/home.jpg"

/**
 * Shows the admin-provided hero photo (public/images/home.jpg) if present,
 * falling back to the abstract "live class" mockup card when it's missing —
 * so the hero never renders a broken-image icon while waiting for the asset.
 */
export function HeroVisual() {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 rounded-[3rem]" style={{ backgroundColor: "var(--primary)", opacity: 0.15 }} />

      {imageFailed ? (
        <div className="relative rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-900 shrink-0" style={{ backgroundColor: "var(--primary)" }}>
              <PlayCircle size={24} />
            </div>
            <div>
              <div className="font-black outfit text-slate-900 dark:text-white">Live Class in Progress</div>
              <div className="text-xs text-slate-400 font-bold">Algebra · Chapter 4</div>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Live
            </span>
          </div>

          <div className="aspect-video rounded-2xl mb-6 flex items-center justify-center" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 30%, transparent), color-mix(in srgb, var(--secondary) 15%, transparent))" }}>
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <PlayCircle size={30} className="text-slate-900" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3.5">
              <div className="flex items-center gap-1 mb-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Top Rated Faculty</div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3.5">
              <div className="flex items-center gap-1 mb-1 text-emerald-600">
                <CheckCircle2 size={14} />
                <span className="text-xs font-black">Verified</span>
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Result-Oriented</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] xl:h-[500px] rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl">
          <img
            src={HERO_IMAGE_SRC}
            alt="Students learning mathematics"
            className="block w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        </div>
      )}

      {/* Floating badge */}
      <div className="hidden sm:flex absolute -bottom-6 -left-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 px-5 py-4 items-center gap-3 animate-float">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-900 font-black" style={{ backgroundColor: "var(--primary)" }}>
          A+
        </div>
        <div>
          <div className="font-black outfit text-slate-900 dark:text-white text-sm">Proven Results</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trusted by students</div>
        </div>
      </div>
    </div>
  )
}
