import { AlertTriangle, ClipboardList, Edit2, FileText, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { REPORT_TYPES, REPORT_TYPE_COLORS, STATUSES } from '../../constants'
import EmptyState from '../ui/EmptyState'
import StatusBadge from '../ui/StatusBadge'

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function resolveFileUrl(filePath) {
  if (!filePath) return ''
  const fileName = filePath.split('/').pop()
  if (!fileName) return ''
  return `http://localhost:8000/uploads/${fileName}`
}

function ReportsList({ reports, loading, onEdit, onDelete, onAddReport }) {
  const [reportTypeFilter, setReportTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchType = reportTypeFilter ? report.report_type === reportTypeFilter : true
      const matchStatus = statusFilter ? report.status === statusFilter : true
      return matchType && matchStatus
    })
  }, [reportTypeFilter, reports, statusFilter])

  const filtersActive = Boolean(reportTypeFilter || statusFilter)

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Lab Reports</h3>
          {filtersActive ? <p className="text-sm text-text-muted">{filteredReports.length} results</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={reportTypeFilter}
            onChange={(event) => setReportTypeFilter(event.target.value)}
            className="transition-default rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Types</option>
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="transition-default rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onAddReport}
            className="transition-default inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Add Report
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-surface-secondary">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Report Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Result</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Reference Range</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Document</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`report-skeleton-${index}`} className="border-b border-surface-tertiary">
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3.5">
                        <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-surface-tertiary" />
                      </td>
                    ))}
                  </tr>
                ))
              : filteredReports.map((report) => {
                  const fileUrl = resolveFileUrl(report.file_path)

                  return (
                    <tr key={report.id} className="transition-default border-b border-surface-tertiary hover:bg-surface-secondary">
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            REPORT_TYPE_COLORS[report.report_type] || REPORT_TYPE_COLORS.Custom
                          }`}
                        >
                          {report.report_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-text-secondary">{formatDate(report.report_date)}</td>
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                          <span>
                            {report.result_value} {report.unit}
                          </span>
                          {report.status === 'Abnormal' ? <AlertTriangle className="h-4 w-4 text-danger" /> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-text-muted">
                        {report.reference_min} - {report.reference_max} {report.unit}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        {fileUrl ? (
                          <button
                            type="button"
                            onClick={() => window.open(fileUrl, '_blank', 'noopener,noreferrer')}
                            className="transition-default inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                          >
                            <FileText className="h-4 w-4" />
                            View
                          </button>
                        ) : (
                          <span className="text-sm text-text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit report"
                            onClick={() => onEdit(report)}
                            className="transition-default rounded-lg p-2 text-text-secondary hover:bg-brand-50 hover:text-brand-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete report"
                            onClick={() => onDelete(report.id)}
                            className="transition-default rounded-lg p-2 text-text-secondary hover:bg-danger-light hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>

      {!loading && reports.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={ClipboardList}
            title="No lab reports yet"
            description="Add the first lab report for this patient"
            action={{ label: 'Add Report', onClick: onAddReport }}
          />
        </div>
      ) : null}

      {!loading && reports.length > 0 && filteredReports.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={ClipboardList}
            title="No reports match the selected filters"
            description="Try adjusting or clearing the filters to see more results"
            action={{
              label: 'Clear Filters',
              onClick: () => {
                setReportTypeFilter('')
                setStatusFilter('')
              },
            }}
          />
        </div>
      ) : null}
    </section>
  )
}

export default ReportsList
