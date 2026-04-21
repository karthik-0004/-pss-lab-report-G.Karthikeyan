import { TrendingDown, TrendingUp } from 'lucide-react'

function StatsCard({ title, value, icon: Icon, iconColor, iconBg, trend, loading }) {
  if (loading) {
    return (
      <div className="transition-default rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-tertiary" />
        <div className="mt-5 h-8 w-16 animate-pulse rounded bg-surface-tertiary" />
        <div className="mt-3 h-3 w-32 animate-pulse rounded bg-surface-tertiary" />
      </div>
    )
  }

  const isPositive = trend && trend.value >= 0

  return (
    <article className="transition-default rounded-2xl border border-border bg-surface p-5 shadow-card duration-200 hover:-translate-y-[1px] hover:border-border-strong hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-text-primary" style={{ animation: 'fadeIn 0.24s ease' }}>
        {value}
      </p>

      {trend ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>
            {Math.abs(trend.value)}% {trend.label}
          </span>
        </div>
      ) : null}
    </article>
  )
}

export default StatsCard
