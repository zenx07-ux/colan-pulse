import { EuiIcon } from '@elastic/eui'
import { formatHms, seededSeconds } from '../utils/format'
import type { Employee } from '../types'

interface IdleRecord {
  start: string
  end: string
  duration: string
  reason: string
  description: string
  device: string
}

function idleRecords(employee: Employee): IdleRecord[] {
  if (employee.idleMinutes < 10) return []

  const device = `WKS-${100 + (employee.idleMinutes % 80)}`
  const firstDuration = Math.min(employee.idleMinutes, 42)
  const records: IdleRecord[] = [
    {
      start: '10:30:12',
      end: '11:12:18',
      duration: formatHms(firstDuration * 60),
      reason: employee.status === 'offline' ? 'Agent offline' : 'No input',
      description:
        employee.status === 'offline'
          ? 'Heartbeat lost'
          : 'Keyboard and mouse idle over 15 min',
      device,
    },
  ]

  if (employee.idleMinutes >= 40) {
    records.push({
      start: '14:05:03',
      end: '14:41:40',
      duration: formatHms(Math.max(8, employee.idleMinutes - firstDuration) * 60),
      reason: 'No input',
      description: 'Idle after lunch',
      device,
    })
  }

  return records
}

export function EmployeeFlyout({
  employee,
  onClose,
}: {
  employee: Employee
  onClose: () => void
}) {
  const workSeconds = seededSeconds(Math.max(0, 480 - employee.idleMinutes), employee.id)
  const idleSeconds = seededSeconds(employee.idleMinutes, employee.name)
  const appsUsed = employee.currentApp ? 1 : 0
  const records = idleRecords(employee)

  return (
    <div className="cp-overlay" onClick={onClose} role="presentation">
      <aside
        className="cp-drawer cp-drawer--detail"
        role="dialog"
        aria-labelledby="employee-flyout-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cp-drawer__head">
          <div className="cp-drawer__head-copy">
            <div className="cp-drawer__title" id="employee-flyout-title">
              {employee.name}
            </div>
            <div className="cp-emp-id">
              {employee.id}
            </div>
          </div>
          <button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cp-drawer__body">
          <div className="cp-detail-stats">
            <div className="cp-detail-stat cp-detail-stat--work">
              <div className="cp-stat__label">Total Work Time</div>
              <div className="cp-stat__value cp-mono">{formatHms(workSeconds)}</div>
            </div>
            <div className="cp-detail-stat cp-detail-stat--idle">
              <div className="cp-stat__label">Total Idle Time</div>
              <div className="cp-stat__value cp-mono">{formatHms(idleSeconds)}</div>
            </div>
            <div className="cp-detail-stat cp-detail-stat--apps">
              <div className="cp-stat__label">Apps Used</div>
              <div className="cp-stat__value">{appsUsed}</div>
            </div>
          </div>

          <button type="button" className="cp-shot-link">
            <EuiIcon type="image" size="m" />
            <span>View Today's Screenshots</span>
            <span aria-hidden>→</span>
          </button>

          <div>
            <div className="cp-card-title" style={{ fontSize: 15, marginBottom: 10 }}>
              Idle Time Details
            </div>
            <div className="cp-table-wrap">
              <table className="cp-table cp-idle-table">
                <thead>
                  <tr>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Description</th>
                    <th>Device</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td className="cp-empty" colSpan={6}>
                        No idle records for today
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={`${record.start}-${record.device}`}>
                        <td className="cp-mono">{record.start}</td>
                        <td className="cp-mono">{record.end}</td>
                        <td className="cp-mono">{record.duration}</td>
                        <td>{record.reason}</td>
                        <td>{record.description}</td>
                        <td className="cp-mono">{record.device}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
