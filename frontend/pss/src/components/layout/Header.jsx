import { Bell, Search } from 'lucide-react'
import { useLocation, useMatch } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPatientById } from '../../api/patients'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/patients': 'Patients',
  '/reports': 'Reports',
}

function Header({ breadcrumb }) {
  const location = useLocation()
  const patientDetailMatch = useMatch('/patients/:patientId')
  const isAddPatientRoute = Boolean(useMatch('/patients/new'))
  const isPatientDetailRoute = Boolean(useMatch('/patients/:id') || patientDetailMatch)

  const { data: patientData } = useQuery({
    queryKey: ['patient', patientDetailMatch?.params?.patientId],
    queryFn: () => getPatientById(patientDetailMatch?.params?.patientId),
    enabled: Boolean(patientDetailMatch?.params?.patientId),
  })

  let title = PAGE_TITLES[location.pathname] || 'PSS Lab'
  if (isAddPatientRoute) title = 'Add Patient'
  if (isPatientDetailRoute) title = 'Patient Profile'

  return (
    <header
      className="fixed right-0 top-0 z-40 flex items-center justify-between border-b border-border bg-surface px-6"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--header-height)',
      }}
    >
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      {isPatientDetailRoute || breadcrumb ? (
        <p className="absolute left-6 top-[38px] text-xs text-text-muted">
          Patients / {breadcrumb?.label || patientData?.patient?.name || 'Patient'}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="transition-default rounded-lg p-2 text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="transition-default rounded-lg p-2 text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-500">
          PS
        </div>
      </div>
    </header>
  )
}

export default Header
