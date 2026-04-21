import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Search, UserPlus, Users } from 'lucide-react'
import { deletePatient, getAllPatients } from '../api/patients'
import AddPatientModal from '../components/patients/AddPatientModal'
import PatientTableRow from '../components/patients/PatientTableRow'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 400)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['patients', debouncedSearch],
    queryFn: () => getAllPatients(debouncedSearch),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onMutate: () => {
      setIsDeleting(true)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      setDeleteTarget(null)
    },
    onSettled: () => {
      setIsDeleting(false)
    },
  })

  const isDebouncing = searchTerm !== debouncedSearch

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Patients</h2>
          <p className="text-sm text-text-muted">{data.length} patients registered</p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="group transition-default inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <UserPlus className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          Add Patient
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name or patient ID..."
          className="transition-default w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-text-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {isDebouncing || isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-secondary">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Patient ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Name</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary">Age</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Reports</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, rowIndex) => (
                    <tr key={`patient-loading-${rowIndex}`} className="border-b border-surface-tertiary">
                      {Array.from({ length: 7 }).map((__, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3.5">
                          <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-surface-tertiary" />
                        </td>
                      ))}
                    </tr>
                  ))
                : null}

              {!isLoading && !isError
                ? data.map((patient, index) => (
                    <PatientTableRow
                      key={patient.patient_id}
                      patient={patient}
                      index={index}
                      onDelete={(patientId) => setDeleteTarget(patientId)}
                    />
                  ))
                : null}
            </tbody>
          </table>
        </div>

        {isError ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-text-primary">Failed to load patients</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="transition-default rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-secondary"
            >
              Try Again
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && data.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No patients yet"
              description="Add your first patient to get started"
              action={{ label: 'Add Patient', onClick: () => setIsAddModalOpen(true) }}
            />
          </div>
        ) : null}
      </section>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget)
          }
        }}
        title="Delete Patient?"
        description="This will permanently delete the patient and all their associated lab reports. This action cannot be undone."
        isLoading={isDeleting}
        confirmDisabled={isDeleting}
      />

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['patients'] })
        }}
      />
    </div>
  )
}

export default PatientsPage
