import { Eye, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const genderStyles = {
  Male: 'bg-blue-50 text-blue-600',
  Female: 'bg-pink-50 text-pink-600',
  Other: 'bg-slate-100 text-slate-600',
}

function PatientTableRow({ patient, onDelete, index }) {
  const navigate = useNavigate()
  const reportsCount = 0
  const firstLetter = patient.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <tr
      className="transition-default border-b border-surface-tertiary hover:bg-surface-secondary"
      style={{ animation: 'fadeInRow 0.28s ease forwards', animationDelay: `${index * 30}ms`, opacity: 0 }}
    >
      <td className="px-4 py-3.5">
        <span className="rounded-md border border-border bg-surface-tertiary px-2 py-0.5 font-mono text-xs text-text-secondary">
          {patient.patient_id}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-500">
            {firstLetter}
          </div>
          <p className="text-sm font-medium text-text-primary">{patient.name}</p>
        </div>
      </td>

      <td className="px-4 py-3.5 text-center text-sm text-text-secondary">{patient.age}</td>

      <td className="px-4 py-3.5">
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${genderStyles[patient.gender] || genderStyles.Other}`}>
          {patient.gender}
        </span>
      </td>

      <td className="px-4 py-3.5 font-mono text-sm text-text-secondary">{patient.contact_number}</td>

      <td className="px-4 py-3.5">
        <span
          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold ${
            reportsCount > 0 ? 'bg-brand-50 text-brand-600' : 'bg-surface-tertiary text-text-muted'
          }`}
        >
          {reportsCount}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate(`/patients/${patient.patient_id}`)}
            className="transition-default rounded-lg p-2 text-text-secondary hover:bg-brand-50 hover:text-brand-500"
            aria-label="View patient"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(patient.patient_id)}
            className="transition-default rounded-lg p-2 text-text-secondary hover:bg-danger-light hover:text-danger"
            aria-label="Delete patient"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default PatientTableRow
