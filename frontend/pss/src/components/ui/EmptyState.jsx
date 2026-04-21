function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-10 text-center shadow-card">
      {Icon ? <Icon className="mb-3 h-10 w-10 text-text-muted" /> : null}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-text-muted">{description}</p>

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="transition-default mt-6 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
}

export default EmptyState
