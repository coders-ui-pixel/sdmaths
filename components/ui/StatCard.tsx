import { LucideIcon } from "lucide-react"

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: LucideIcon
  label: string
  value: string | number
  tone?: "primary" | "green" | "amber" | "red"
}) {
  const toneClasses = {
    primary: "bg-[var(--primary)]/10 text-[var(--primary)]",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${toneClasses[tone]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 truncate">{label}</div>
        <div className="text-2xl font-black outfit text-slate-800 dark:text-slate-100 truncate">{value}</div>
      </div>
    </div>
  )
}
