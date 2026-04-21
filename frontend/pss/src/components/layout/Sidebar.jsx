import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { Activity, FileText, LayoutDashboard, Users } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { getDashboardStats } from '../../api/reports'

const menuItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Patients', to: '/patients', icon: Users },
  { label: 'Reports', to: '/reports', icon: FileText },
]

function Sidebar() {
  const location = useLocation()
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60,
  })
  const abnormalCount = dashboardStats?.abnormal_reports || 0

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-surface"
      style={{ width: 'var(--sidebar-width)' }}
    >
      <div className="flex h-full flex-col px-4 py-5">
        <div className="mb-8 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
              <Activity className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <p className="text-base font-bold text-text-primary">PSS Lab</p>
              <p className="text-xs text-text-muted">Patient Management</p>
            </div>
          </div>
        </div>

        <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
          Main Menu
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  'transition-default relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'border-l-2 border-brand-500 bg-brand-50 pl-[10px] text-brand-600'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary',
                )}
              >
                <Icon className={clsx('h-4 w-4', isActive ? 'text-brand-500' : 'text-text-muted')} />
                <span>{item.label}</span>
                {item.to === '/reports' && abnormalCount > 0 ? (
                  <span className="ml-auto inline-flex min-w-[18px] animate-pulse items-center justify-center rounded-full bg-danger px-1.5 py-0.5 text-xs text-white">
                    {abnormalCount}
                  </span>
                ) : null}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-border px-2 pt-4 text-[11px] text-text-muted">
          <p>PSS Automote</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
