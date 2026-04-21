import clsx from 'clsx'
import { STATUS_COLORS } from '../../constants'

function StatusBadge({ status }) {
  const styles = STATUS_COLORS[status] || STATUS_COLORS.Pending

  return (
    <span
      className={clsx(
        'status-badge transition-default inline-flex items-center gap-2',
        styles.bg,
        styles.text,
      )}
    >
      <span className={clsx('h-2 w-2 rounded-full', styles.dot)} />
      {status}
    </span>
  )
}

export default StatusBadge
