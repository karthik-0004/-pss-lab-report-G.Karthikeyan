import { Suspense, lazy } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { WifiOff, Wifi } from 'lucide-react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import useNetworkStatus from './hooks/useNetworkStatus'
import { queryClient } from './lib/queryClient'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const PatientsPage = lazy(() => import('./pages/PatientsPage'))
const AddPatientPage = lazy(() => import('./pages/AddPatientPage'))
const PatientDetailPage = lazy(() => import('./pages/PatientDetailPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))

function RouteShell({ children, breadcrumb }) {
  return <MainLayout breadcrumb={breadcrumb}>{children}</MainLayout>
}

function App() {
  const { isOnline, showBackOnline } = useNetworkStatus()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {!isOnline ? (
          <div className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-warning bg-warning-light px-4 py-2 text-sm font-medium text-yellow-800 shadow-dropdown">
            <span className="inline-flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              You are offline - changes may not be saved
            </span>
          </div>
        ) : null}

        {isOnline && showBackOnline ? (
          <div className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-success bg-success-light px-4 py-2 text-sm font-medium text-success shadow-dropdown">
            <span className="inline-flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Back online
            </span>
          </div>
        ) : null}

        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-surface-secondary">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Routes>
            <Route
              path="/"
              element={
                <RouteShell>
                  <DashboardPage />
                </RouteShell>
              }
            />
            <Route
              path="/patients"
              element={
                <RouteShell>
                  <PatientsPage />
                </RouteShell>
              }
            />
            <Route
              path="/patients/new"
              element={
                <RouteShell>
                  <AddPatientPage />
                </RouteShell>
              }
            />
            <Route
              path="/patients/:patientId"
              element={
                <RouteShell breadcrumb={{ label: 'Patient' }}>
                  <PatientDetailPage />
                </RouteShell>
              }
            />
            <Route
              path="/reports"
              element={
                <RouteShell>
                  <ReportsPage />
                </RouteShell>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
