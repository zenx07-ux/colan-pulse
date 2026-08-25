import type { PresenceStatus } from '../types'

const STATUS_COPY: Record<PresenceStatus, string> = {
  active: 'Active',
  idle: 'Idle',
  offline: 'Offline',
}

export function StatusBadge({ status }: { status: PresenceStatus }) {
  return (
    <span className={`cp-status cp-status--${status}`}>
      <span className="cp-status__dot" />
      {STATUS_COPY[status]}
    </span>
  )
}
