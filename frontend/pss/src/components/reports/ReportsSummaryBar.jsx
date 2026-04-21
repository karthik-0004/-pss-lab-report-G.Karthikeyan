import { AlertTriangle, CheckCircle, Clock, List } from 'lucide-react'

function SummaryChip({ icon: Icon, value, label, colorClass, loading }) {
  if (loading) {
    return <div className="h-[58px] flex-1 animate-pulse rounded-xl border border-border bg-surface-tertiary" />
  }

  return (
    <div className="transition-default flex min-w-[170px] flex-1 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 hover:-translate-y-[1px] hover:border-border-strong hover:shadow-card-hover">
      <Icon className={`h-5 w-5 ${colorClass}`} />
      <div>
        <p className="text-lg font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  )
}

function ReportsSummaryBar({ reports, loading }) {
  const normalCount = reports.filter((report) => report.status === 'Normal').length
  const abnormalCount = reports.filter((report) => report.status === 'Abnormal').length
  const pendingCount = reports.filter((report) => report.status === 'Pending').length

  return (
    <section className="flex flex-wrap gap-3">
      <SummaryChip icon={List} value={reports.length} label="Total shown" colorClass="text-text-secondary" loading={loading} />
      <SummaryChip icon={CheckCircle} value={normalCount} label="Normal" colorClass="text-success" loading={loading} />
      <SummaryChip icon={AlertTriangle} value={abnormalCount} label="Abnormal" colorClass="text-danger" loading={loading} />
      <SummaryChip icon={Clock} value={pendingCount} label="Pending" colorClass="text-warning" loading={loading} />
    </section>
  )
}

export default ReportsSummaryBar
