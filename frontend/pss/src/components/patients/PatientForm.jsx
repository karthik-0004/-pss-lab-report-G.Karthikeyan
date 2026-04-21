import { useEffect, useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'
import { GENDERS } from '../../constants'

const PHONE_REGEX = /^[6-9]\d{9}$/

const defaultValues = {
  name: '',
  age: '',
  gender: '',
  contact_number: '',
}

function validateField(field, value, allValues) {
  if (field === 'name') {
    if (!value.trim()) return 'Full Name is required'
    if (value.trim().length < 2) return 'Full Name must be at least 2 characters'
  }

  if (field === 'age') {
    if (value === '' || value === null || value === undefined) return 'Age is required'
    const age = Number(value)
    if (Number.isNaN(age) || age < 0 || age > 150) return 'Age must be between 0 and 150'
  }

  if (field === 'gender') {
    if (!value) return 'Gender is required'
  }

  if (field === 'contact_number') {
    if (!value.trim()) return 'Contact Number is required'
    if (!PHONE_REGEX.test(value.trim())) return 'Enter a valid 10-digit Indian mobile number'
  }

  if (field === 'all') {
    const nextErrors = {}
    Object.keys(allValues).forEach((key) => {
      const error = validateField(key, allValues[key], allValues)
      if (error) nextErrors[key] = error
    })
    return nextErrors
  }

  return ''
}

function PatientForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel = 'Save Patient',
}) {
  const [values, setValues] = useState({
    ...defaultValues,
    ...initialValues,
    age: initialValues?.age ?? '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues({
      ...defaultValues,
      ...initialValues,
      age: initialValues?.age ?? '',
    })
    setErrors({})
  }, [initialValues])

  const updateField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field) => {
    const error = validateField(field, values[field], values)
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

    const validationErrors = validateField('all', '', values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    await onSubmit({
      name: values.name.trim(),
      age: Number(values.age),
      gender: values.gender,
      contact_number: values.contact_number.trim(),
    })
  }

  const fieldBaseClass =
    'transition-default w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-text-primary">Full Name</label>
          <input
            type="text"
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            onBlur={() => handleBlur('name')}
            disabled={isLoading}
            className={`${fieldBaseClass} ${
              errors.name
                ? 'border-danger ring-danger/20 focus:border-danger focus:ring-danger/20'
                : 'border-border focus:border-brand-500 focus:ring-brand-500'
            }`}
            placeholder="Enter full name"
          />
          {errors.name ? <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.name}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Age</label>
          <input
            type="number"
            min="0"
            max="150"
            value={values.age}
            onChange={(event) => updateField('age', event.target.value)}
            onBlur={() => handleBlur('age')}
            disabled={isLoading}
            className={`${fieldBaseClass} ${
              errors.age
                ? 'border-danger ring-danger/20 focus:border-danger focus:ring-danger/20'
                : 'border-border focus:border-brand-500 focus:ring-brand-500'
            }`}
            placeholder="Enter age"
          />
          {errors.age ? <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.age}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Gender</label>
          <select
            value={values.gender}
            onChange={(event) => updateField('gender', event.target.value)}
            onBlur={() => handleBlur('gender')}
            disabled={isLoading}
            className={`${fieldBaseClass} ${
              errors.gender
                ? 'border-danger ring-danger/20 focus:border-danger focus:ring-danger/20'
                : 'border-border focus:border-brand-500 focus:ring-brand-500'
            }`}
          >
            <option value="">Select Gender</option>
            {GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
          {errors.gender ? (
            <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.gender}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Contact Number</label>
          <input
            type="text"
            value={values.contact_number}
            onChange={(event) => updateField('contact_number', event.target.value)}
            onBlur={() => handleBlur('contact_number')}
            disabled={isLoading}
            className={`${fieldBaseClass} ${
              errors.contact_number
                ? 'border-danger ring-danger/20 focus:border-danger focus:ring-danger/20'
                : 'border-border focus:border-brand-500 focus:ring-brand-500'
            }`}
            placeholder="e.g. 9876543210"
          />
          {errors.contact_number ? (
            <p className="mt-1 animate-[fadeIn_0.2s_ease] text-xs text-danger">{errors.contact_number}</p>
          ) : null}
        </div>
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

export default PatientForm
