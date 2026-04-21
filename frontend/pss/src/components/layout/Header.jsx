import { Bell, Search } from 'lucide-react'
import { useLocation, useMatch } from 'react-router-dom'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/patients': 'Patients',
  '/reports': 'Reports',
}

function Header() {
  const location = useLocation()
  const isAddPatientRoute = Boolean(useMatch('/patients/new'))
  const isPatientDetailRoute = Boolean(useMatch('/patients/:id') || useMatch('/patients/:patientId'))

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
