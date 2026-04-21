import { Edit2, Phone, User } from 'lucide-react'

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StatBlock({ label, value, borderClass }) {
  return (
    <div className={`border-l-2 pl-3 ${borderClass}`}>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
    </div>
  )
}

function PatientProfileCard({ patient, reportCount, abnormalCount, onEdit, loading }) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-surface-tertiary" />
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse rounded bg-surface-tertiary" />
              <div className="h-5 w-28 animate-pulse rounded bg-surface-tertiary" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="h-14 w-24 animate-pulse rounded bg-surface-tertiary" />
            <div className="h-14 w-24 animate-pulse rounded bg-surface-tertiary" />
            <div className="h-14 w-24 animate-pulse rounded bg-surface-tertiary" />
          </div>
        </div>
      </section>
    )
  }

  if (!patient) return null

  const initial = patient.name?.charAt(0)?.toUpperCase() || '?'
  const normalCount = Math.max(reportCount - abnormalCount, 0)

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="transition-default inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
        >
          <Edit2 className="h-4 w-4" />
          Edit Patient
        </button>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}
          >
            {initial}
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary">{patient.name}</h2>
            <p className="mt-1 inline-flex rounded-md border border-border bg-surface-tertiary px-2 py-0.5 font-mono text-xs text-text-secondary">
              {patient.patient_id}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-tertiary px-2.5 py-1 text-sm text-text-secondary">
                <User className="h-3.5 w-3.5" />
                Age: {patient.age}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-tertiary px-2.5 py-1 text-sm text-text-secondary">
                <User className="h-3.5 w-3.5" />
                {patient.gender}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-tertiary px-2.5 py-1 text-sm text-text-secondary">
                <Phone className="h-3.5 w-3.5" />
                {patient.contact_number}
              </span>
            </div>

            <p className="mt-3 text-xs text-text-muted">Registered on {formatDate(patient.created_at)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <StatBlock label="Total Reports" value={reportCount} borderClass="border-brand-500" />
          <StatBlock label="Normal Reports" value={normalCount} borderClass="border-success" />
          <StatBlock label="Abnormal Reports" value={abnormalCount} borderClass="border-danger" />
        </div>
      </div>
    </section>
  )
}

export default PatientProfileCard
