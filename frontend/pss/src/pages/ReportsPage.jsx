import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Download } from 'lucide-react'
import { deleteReport, getAllReports } from '../api/reports'
import GlobalReportsTable from '../components/reports/GlobalReportsTable'
import ReportModal from '../components/reports/ReportModal'
import ReportsFilterBar from '../components/reports/ReportsFilterBar'
import ReportsSummaryBar from '../components/reports/ReportsSummaryBar'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const PAGE_SIZE = 15

const initialFilters = {
  report_type: '',
  status: '',
  date_from: '',
  date_to: '',
  search: '',
}

function ReportsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingReport, setEditingReport] = useState(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => getAllReports(filters),
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
      setDeleteTarget(null)
    },
  })

  const reportsWithSearch = useMemo(() => {
    const rows = data || []
    const search = (filters.search || '').trim().toLowerCase()
    if (!search) return rows

    return rows.filter((report) => {
      const name = report.patient?.name?.toLowerCase() || ''
      const id = report.patient?.patient_id?.toLowerCase() || ''
      return name.includes(search) || id.includes(search)
    })
  }, [data, filters.search])

  const totalPages = Math.max(Math.ceil(reportsWithSearch.length / PAGE_SIZE), 1)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pagedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return reportsWithSearch.slice(start, start + PAGE_SIZE)
  }, [currentPage, reportsWithSearch])

  const hasActiveFilters = Object.values(filters).some((value) => String(value || '').trim() !== '')

  return (
    <div className="animate-fadeIn space-y-4">
      {isFetching && !isLoading ? <div className="h-0.5 animate-[loadingBar_0.8s_ease-in-out_infinite] rounded bg-brand-500" /> : null}

      {isError ? (
        <div className="flex flex-col gap-3 rounded-xl border border-danger bg-danger-light p-4 text-danger sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Failed to load reports</p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="transition-default rounded-lg border border-danger px-3 py-1.5 text-sm font-medium hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Reports</h2>
          <p className="text-sm text-text-muted">{reportsWithSearch.length} total reports</p>
        </div>

        <button
          type="button"
          title="Export coming soon"
          className="transition-default inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <ReportsFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onClearAll={() => {
          setFilters(initialFilters)
          setCurrentPage(1)
        }}
        resultCount={reportsWithSearch.length}
        isLoading={isLoading}
      />

      <ReportsSummaryBar reports={reportsWithSearch} loading={isLoading} />

      <GlobalReportsTable
        reports={pagedReports}
        loading={isLoading}
        onEdit={(report) => {
          setEditingReport(report)
          setIsReportModalOpen(true)
        }}
        onDelete={(reportId) => setDeleteTarget(reportId)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalCount={reportsWithSearch.length}
        pageSize={PAGE_SIZE}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setFilters(initialFilters)
          setCurrentPage(1)
        }}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['reports'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
          ])
        }}
        patientId={editingReport?.patient?.patient_id}
        report={editingReport}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget)
          }
        }}
        title="Delete Report?"
        description="This will permanently delete the lab report. This action cannot be undone."
        isLoading={deleteMutation.isPending}
        confirmDisabled={deleteMutation.isPending}
      />
    </div>
  )
}

export default ReportsPage
