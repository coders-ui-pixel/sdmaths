export function StandingMeter({ percent, size = 168, label }: { percent: number; size?: number; label?: string }) {
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          className="stroke-slate-100 dark:stroke-slate-800"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="url(#standingMeterGradient)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="standingMeterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black outfit text-slate-900 dark:text-white">{Math.round(clamped)}%</span>
        {label && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</span>}
      </div>
    </div>
  )
}
