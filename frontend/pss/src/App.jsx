import { Suspense, lazy } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { queryClient } from './lib/queryClient'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const PatientsPage = lazy(() => import('./pages/PatientsPage'))
const AddPatientPage = lazy(() => import('./pages/AddPatientPage'))
const PatientDetailPage = lazy(() => import('./pages/PatientDetailPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))

function RouteShell({ children }) {
  return <MainLayout>{children}</MainLayout>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
                <RouteShell>
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
