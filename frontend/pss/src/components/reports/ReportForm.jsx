import { FileText, Upload, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { REPORT_TYPES } from '../../constants'
import StatusBadge from '../ui/StatusBadge'
import LoadingSpinner from '../ui/LoadingSpinner'

const defaultValues = {
  report_type: '',
  report_date: '',
  result_value: '',
  unit: '',
  reference_min: '',
  reference_max: '',
  file: null,
}

function formatFileSize(bytes) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function computePreviewStatus(resultValue, referenceMin, referenceMax) {
  const rv = Number(resultValue)
  const min = Number(referenceMin)
  const max = Number(referenceMax)

  if (
    resultValue === '' ||
    referenceMin === '' ||
    referenceMax === '' ||
    Number.isNaN(rv) ||
    Number.isNaN(min) ||
    Number.isNaN(max)
  ) {
    return null
  }

  return rv < min || rv > max ? 'Abnormal' : 'Normal'
}

function validateField(field, values) {
  const rv = Number(values.result_value)
  const min = Number(values.reference_min)
  const max = Number(values.reference_max)

  if (field === 'report_type' && !values.report_type) return 'Report Type is required'
  if (field === 'report_date' && !values.report_date) return 'Report Date is required'
  if (field === 'result_value') {
    if (values.result_value === '' || Number.isNaN(rv)) return 'Result Value is required'
  }
  if (field === 'unit' && !values.unit.trim()) return 'Unit is required'
  if (field === 'reference_min') {
    if (values.reference_min === '' || Number.isNaN(min) || min < 0) return 'Reference Min must be a valid positive number'
  }
  if (field === 'reference_max') {
    if (values.reference_max === '' || Number.isNaN(max)) return 'Reference Max is required'
    if (!Number.isNaN(min) && max <= min) return 'Max must be greater than Min'
  }

  if (field === 'all') {
    const errors = {}
    const keys = ['report_type', 'report_date', 'result_value', 'unit', 'reference_min', 'reference_max']
    keys.forEach((key) => {
      const error = validateField(key, values)
      if (error) errors[key] = error
    })
    return errors
  }

  return ''
}

function ReportForm({ initialValues, onSubmit, onCancel, isLoading, submitLabel }) {
  const [values, setValues] = useState({ ...defaultValues, ...initialValues, file: null })
  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  useEffect(() => {
    setValues({ ...defaultValues, ...initialValues, file: null })
    setErrors({})
  }, [initialValues])

  useEffect(() => {
    if (!values.file || !values.file.type.startsWith('image/')) {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
      setImagePreviewUrl('')
      return
    }

    const preview = URL.createObjectURL(values.file)
    setImagePreviewUrl(preview)

    return () => {
      URL.revokeObjectURL(preview)
    }
  }, [values.file])

  const statusPreview = useMemo(
    () => computePreviewStatus(values.result_value, values.reference_min, values.reference_max),
    [values.reference_min, values.reference_max, values.result_value],
  )

  const today = new Date().toISOString().split('T')[0]

  const setField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field) => {
    const error = validateField(field, values)
    setErrors((prev) => {
      if (!error) {
        const { [field]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [field]: error }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateField('all', values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) return

    await onSubmit({
      report_type: values.report_type,
      report_date: values.report_date,
      result_value: values.result_value,
      unit: values.unit.trim(),
      reference_min: values.reference_min,
      reference_max: values.reference_max,
      file: values.file,
    })
  }

  const handleFileSelect = (file) => {
    if (!file) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, file: 'Only PDF, JPG, JPEG, PNG files are allowed' }))
      return
    }
    setErrors((prev) => {
      const { file: _, ...rest } = prev
      return rest
    })
    setField('file', file)
  }

  const fileZoneClass = isDragging
    ? 'border-brand-500 bg-brand-50'
    : 'border-border hover:border-brand-300 hover:bg-brand-50'

  const inputClass = (field) =>
    `transition-default w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-danger ring-danger/20 focus:border-danger focus:ring-danger/20'
        : 'border-border focus:border-brand-500 focus:ring-brand-500'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-text-primary">Report Type</label>
          <select
            value={values.report_type}
            onChange={(event) => setField('report_type', event.target.value)}
            onBlur={() => handleBlur('report_type')}
            disabled={isLoading}
            className={inputClass('report_type')}
          >
            <option value="">Select Report Type</option>
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.report_type ? <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.report_type}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Report Date</label>
          <input
            type="date"
            max={today}
            value={values.report_date}
            onChange={(event) => setField('report_date', event.target.value)}
            onBlur={() => handleBlur('report_date')}
            disabled={isLoading}
            className={inputClass('report_date')}
          />
          {errors.report_date ? <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.report_date}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Result Value</label>
          <input
            type="number"
            step="0.01"
            value={values.result_value}
            onChange={(event) => setField('result_value', event.target.value)}
            onBlur={() => handleBlur('result_value')}
            disabled={isLoading}
            className={inputClass('result_value')}
          />
          {errors.result_value ? <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.result_value}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Unit</label>
          <input
            type="text"
            placeholder="e.g. mg/dL, g/L, mmol/L"
            value={values.unit}
            onChange={(event) => setField('unit', event.target.value)}
            onBlur={() => handleBlur('unit')}
            disabled={isLoading}
            className={inputClass('unit')}
          />
          {errors.unit ? <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.unit}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Reference Min</label>
          <input
            type="number"
            step="0.01"
            value={values.reference_min}
            onChange={(event) => setField('reference_min', event.target.value)}
            onBlur={() => handleBlur('reference_min')}
            disabled={isLoading}
            className={inputClass('reference_min')}
          />
          {errors.reference_min ? <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.reference_min}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Reference Max</label>
          <input
            type="number"
            step="0.01"
            value={values.reference_max}
            onChange={(event) => setField('reference_max', event.target.value)}
            onBlur={() => handleBlur('reference_max')}
            disabled={isLoading}
            className={inputClass('reference_max')}
          />
          {errors.reference_max ? <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.reference_max}</p> : null}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-text-primary">Report Document (PDF or Image)</label>
          <div
            onDragEnter={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setIsDragging(false)
            }}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragging(false)
              handleFileSelect(event.dataTransfer.files?.[0])
            }}
            className={`transition-default rounded-xl border-2 border-dashed p-4 text-center ${fileZoneClass}`}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => handleFileSelect(event.target.files?.[0])}
              disabled={isLoading}
              className="hidden"
              id="report-file-input"
            />
            <label htmlFor="report-file-input" className="cursor-pointer">
              <Upload className="mx-auto mb-2 h-5 w-5 text-text-muted" />
              <p className="text-sm text-text-muted">Click to upload or drag and drop</p>
            </label>
          </div>

          {values.file ? (
            <div className="mt-3 rounded-xl border border-border bg-surface-secondary p-3">
              <div className="flex items-start justify-between gap-3">
                {values.file.type.startsWith('image/') && imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-danger" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{values.file.name}</p>
                      <p className="text-xs text-text-muted">{formatFileSize(values.file.size)}</p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setField('file', null)}
                  className="transition-default rounded-md p-1.5 text-text-muted hover:bg-surface-tertiary hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}

          {errors.file ? <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.file}</p> : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-secondary p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Status Preview</p>
        {statusPreview ? (
          <div className="flex items-center gap-3">
            <StatusBadge status={statusPreview} />
            <p className="text-sm text-text-secondary">
              {statusPreview === 'Normal' ? 'Result is within normal range' : 'Result is outside the reference range'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-muted">Status will be computed automatically</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="transition-default rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="transition-default inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : null}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ReportForm
