import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-5">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-black outfit text-slate-700 dark:text-slate-200 mb-1.5">{title}</h3>
      {subtitle && <p className="text-slate-400 text-sm max-w-sm leading-relaxed">{subtitle}</p>}
      {children}
    </div>
  )
}
