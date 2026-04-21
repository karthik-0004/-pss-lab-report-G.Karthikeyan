import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, AlertTriangle, Calendar, FileText, RefreshCw, Users } from 'lucide-react'
import { getDashboardStats } from '../api/reports'
import RecentReportsTable from '../components/dashboard/RecentReportsTable'
import StatsCard from '../components/dashboard/StatsCard'

function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [rotateRefreshIcon, setRotateRefreshIcon] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
  })

  const filteredReports = useMemo(() => {
    const reports = stats?.recent_reports || []
    if (!statusFilter) return reports
    return reports.filter((report) => report.status === statusFilter)
  }, [stats, statusFilter])

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  return (
    <div className="animate-fadeIn space-y-5">
      {isError ? (
        <div className="flex flex-col gap-3 rounded-xl border border-danger bg-danger-light p-4 text-danger sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <p className="text-sm font-medium">
              Failed to load dashboard data. Please check if the backend server is running.
            </p>
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
          <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
          <p className="text-sm text-text-muted">Welcome back - here&apos;s what&apos;s happening today</p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          onMouseEnter={() => setRotateRefreshIcon(true)}
          onMouseLeave={() => setRotateRefreshIcon(false)}
          className="transition-default inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary hover:border-border-strong hover:bg-surface-tertiary hover:text-text-primary"
        >
          <RefreshCw
            className={`h-4 w-4 transition-transform duration-200 ${rotateRefreshIcon ? 'rotate-180' : 'rotate-0'}`}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fadeIn" style={{ animationDelay: '0ms' }}>
          <StatsCard
            title="Total Patients"
            value={stats?.total_patients ?? 0}
            icon={Users}
            iconBg="bg-brand-50"
            iconColor="text-brand-500"
            loading={isLoading}
          />
        </div>
        <div className="animate-fadeIn" style={{ animationDelay: '60ms' }}>
          <StatsCard
            title="Total Reports"
            value={stats?.total_reports ?? 0}
            icon={FileText}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            loading={isLoading}
          />
        </div>
        <div className="animate-fadeIn" style={{ animationDelay: '120ms' }}>
          <StatsCard
            title="Abnormal Reports"
            value={stats?.abnormal_reports ?? 0}
            icon={AlertTriangle}
            iconBg="bg-danger-light"
            iconColor="text-danger"
            loading={isLoading}
          />
        </div>
        <div className="animate-fadeIn" style={{ animationDelay: '180ms' }}>
          <StatsCard
            title="Reports Today"
            value={stats?.reports_today ?? 0}
            icon={Calendar}
            iconBg="bg-success-light"
            iconColor="text-success"
            loading={isLoading}
          />
        </div>
      </div>

      <RecentReportsTable
        reports={filteredReports}
        loading={isLoading}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => setStatusFilter(value)}
      />
    </div>
  )
}

export default DashboardPage
