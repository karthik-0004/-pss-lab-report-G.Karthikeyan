import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { REPORT_TYPES, STATUSES } from '../../constants'
import LoadingSpinner from '../ui/LoadingSpinner'

function formatChipDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function ReportsFilterBar({ filters, onFilterChange, onClearAll, resultCount, isLoading }) {
  const [inputValue, setInputValue] = useState(filters.search || '')
  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    setInputValue(filters.search || '')
  }, [filters.search])

  useEffect(() => {
    if (inputValue === (filters.search || '')) {
      setIsDebouncing(false)
      return
    }

    setIsDebouncing(true)
    const timeout = setTimeout(() => {
      onFilterChange({ ...filters, search: inputValue })
      setIsDebouncing(false)
    }, 400)

    return () => clearTimeout(timeout)
  }, [filters, inputValue, onFilterChange])

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => String(value || '').trim() !== ''),
    [filters],
  )

  const chips = useMemo(() => {
    const list = []
    if (filters.search) list.push({ key: 'search', label: `Search: ${filters.search}` })
    if (filters.report_type) list.push({ key: 'report_type', label: `Type: ${filters.report_type}` })
    if (filters.status) list.push({ key: 'status', label: `Status: ${filters.status}` })
    if (filters.date_from) list.push({ key: 'date_from', label: `From: ${formatChipDate(filters.date_from)}` })
    if (filters.date_to) list.push({ key: 'date_to', label: `To: ${formatChipDate(filters.date_to)}` })
    return list
  }, [filters.date_from, filters.date_to, filters.report_type, filters.search, filters.status])

  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Search patient name or ID..."
              className="transition-default w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-9 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {isDebouncing ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            ) : null}
            {!isDebouncing && inputValue ? (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="transition-default absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:bg-surface-tertiary hover:text-danger"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <select
            value={filters.report_type}
            onChange={(event) => updateFilter('report_type', event.target.value)}
            className="transition-default w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 sm:w-40"
          >
            <option value="">All Types</option>
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
            className="transition-default w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 sm:w-36"
          >
            <option value="">All Status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <div className="w-full sm:w-40">
            <label className="mb-1 block text-xs text-text-muted">From</label>
            <input
              type="date"
              value={filters.date_from}
              max={filters.date_to || undefined}
              onChange={(event) => updateFilter('date_from', event.target.value)}
              className="transition-default w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="w-full sm:w-40">
            <label className="mb-1 block text-xs text-text-muted">To</label>
            <input
              type="date"
              value={filters.date_to}
              min={filters.date_from || undefined}
              onChange={(event) => updateFilter('date_to', event.target.value)}
              className="transition-default w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isLoading ? (
            <p className="text-sm text-text-muted">
              Showing {resultCount} reports
              {hasActiveFilters ? <span className="font-medium text-brand-600"> with active filters</span> : null}
            </p>
          ) : null}

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearAll}
              className="transition-default inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-text-secondary hover:text-danger"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          ) : null}
        </div>
      </div>

      {chips.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="animate-slideInRight inline-flex items-center gap-1 rounded-full border border-border bg-surface-tertiary px-3 py-1 text-xs font-medium text-text-secondary"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => updateFilter(chip.key, '')}
                className="transition-default rounded p-0.5 text-text-muted hover:text-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default ReportsFilterBar
