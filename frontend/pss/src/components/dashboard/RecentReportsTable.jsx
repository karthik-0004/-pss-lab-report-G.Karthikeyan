import { ExternalLink, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../ui/EmptyState'
import StatusBadge from '../ui/StatusBadge'

function formatReportDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function RecentReportsTable({ reports, loading, statusFilter, onStatusFilterChange }) {
  const navigate = useNavigate()

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Recent Reports</h2>
          <p className="text-sm text-text-muted">Last 10 reports across all patients</p>
        </div>

        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
          className="transition-default rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Status</option>
          <option value="Normal">Normal</option>
          <option value="Abnormal">Abnormal</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-surface-secondary">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Patient Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Report Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Result</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Reference Range</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-surface-tertiary">
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3.5">
                        <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-surface-tertiary" />
                      </td>
                    ))}
                  </tr>
                ))
              : reports.map((report) => (
                  <tr key={report.id} className="transition-default border-b border-surface-tertiary hover:bg-surface-secondary">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-text-primary">{report.patient?.name || '-'}</p>
                      <p className="text-xs text-text-muted">{report.patient?.patient_id || '-'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary">
                        {report.report_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">{formatReportDate(report.report_date)}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-text-primary">
                      {report.result_value} {report.unit}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-muted">
                      {report.reference_min} - {report.reference_max}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/patients/${report.patient?.patient_id}`)}
                        className="transition-default rounded p-2 text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
                        aria-label="Open patient details"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!loading && reports.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FileText}
              title="No reports found"
              description="Reports will appear here once lab results are uploaded"
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default RecentReportsTable
