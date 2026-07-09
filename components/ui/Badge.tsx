import { ReactNode } from "react"

const variants = {
  primary: "text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20",
  green: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400",
  amber: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
  red: "text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400",
  slate: "text-slate-500 bg-slate-500/10 border-slate-500/20 dark:text-slate-400",
}

export function Badge({ children, variant = "primary" }: { children: ReactNode; variant?: keyof typeof variants }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${variants[variant]}`}>
      {children}
    </span>
  )
}
