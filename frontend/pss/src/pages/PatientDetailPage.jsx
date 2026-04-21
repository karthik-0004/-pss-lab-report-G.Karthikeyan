import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ChevronRight, UserX } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPatientById } from '../api/patients'
import { deleteReport } from '../api/reports'
import AddPatientModal from '../components/patients/AddPatientModal'
import PatientProfileCard from '../components/patients/PatientProfileCard'
import ReportModal from '../components/reports/ReportModal'
import ReportsList from '../components/reports/ReportsList'
import ConfirmDialog from '../components/ui/ConfirmDialog'

function PatientDetailPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [deleteReportTarget, setDeleteReportTarget] = useState(null)
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false)

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatientById(patientId),
    enabled: Boolean(patientId),
  })

  const deleteReportMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
      setDeleteReportTarget(null)
    },
  })

  const abnormalCount = data?.reports?.filter((report) => report.status === 'Abnormal').length ?? 0

  if (isError && error?.status === 404) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <UserX className="h-12 w-12 text-text-muted" />
        <h2 className="text-xl font-bold text-text-primary">Patient not found</h2>
        <button
          type="button"
          onClick={() => navigate('/patients')}
          className="transition-default rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Go back to Patients
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn space-y-4">
      {isError && error?.status !== 404 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-danger bg-danger-light p-4 text-danger sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Failed to load patient data</p>
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

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-medium text-brand-600 transition-default hover:text-brand-700"
      >
        ← Back to Patients
      </button>

      <div className="flex items-center gap-2 text-sm text-text-muted">
        <button
          type="button"
          onClick={() => navigate('/patients')}
          className="transition-default hover:underline"
        >
          Patients
        </button>
        <ChevronRight className="h-4 w-4" />
        <span>{isLoading ? 'Loading...' : data?.patient?.name || 'Patient'}</span>
      </div>

      <PatientProfileCard
        patient={data?.patient}
        reportCount={data?.reports?.length ?? 0}
        abnormalCount={abnormalCount}
        onEdit={() => setIsEditPatientModalOpen(true)}
        loading={isLoading}
      />

      <div className="mt-6">
        <ReportsList
          reports={data?.reports ?? []}
          loading={isLoading}
          onEdit={(report) => {
            setEditingReport(report)
            setIsReportModalOpen(true)
          }}
          onDelete={(reportId) => setDeleteReportTarget(reportId)}
          onAddReport={() => {
            setEditingReport(null)
            setIsReportModalOpen(true)
          }}
        />
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['patient', patientId] })}
        patientId={patientId}
        report={editingReport}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteReportTarget)}
        onClose={() => setDeleteReportTarget(null)}
        onConfirm={() => {
          if (deleteReportTarget) {
            deleteReportMutation.mutate(deleteReportTarget)
          }
        }}
        title="Delete Report?"
        description="This will permanently delete the lab report. This action cannot be undone."
        isLoading={deleteReportMutation.isPending}
        confirmDisabled={deleteReportMutation.isPending}
      />

      <AddPatientModal
        isOpen={isEditPatientModalOpen}
        onClose={() => setIsEditPatientModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
          queryClient.invalidateQueries({ queryKey: ['patients'] })
        }}
        patient={data?.patient || null}
      />
    </div>
  )
}

export default PatientDetailPage
