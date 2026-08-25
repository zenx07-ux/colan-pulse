import { alerts } from '../data/notifications'

const TONE: Record<
  (typeof alerts)[number]['severity'],
  { dot: string; bg: string; border: string; title: string }
> = {
  danger: {
    dot: 'var(--cp-danger)',
    bg: 'var(--cp-danger-bg)',
    border: 'var(--cp-danger-border)',
    title: 'var(--cp-danger-text)',
  },
  warning: {
    dot: 'var(--cp-warning)',
    bg: 'var(--cp-warning-bg)',
    border: 'var(--cp-warning-border)',
    title: 'var(--cp-warning-text)',
  },
  default: {
    dot: 'var(--cp-vis8)',
    bg: 'var(--cp-subdued)',
    border: 'var(--cp-border)',
    title: 'var(--cp-heading)',
  },
}

export function AlertsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="cp-overlay cp-overlay--center" onClick={onClose} role="presentation">
      <div
        className="cp-modal"
        role="dialog"
        aria-labelledby="alerts-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cp-modal__head">
          <span className="cp-drawer__title" id="alerts-title">
            Active alerts
          </span>
          <button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="cp-modal__body">
          {alerts.map((alert) => {
            const tone = TONE[alert.severity]
            return (
              <div
                key={alert.id}
                className="cp-alert-row"
                style={{ background: tone.bg, border: `1px solid ${tone.border}` }}
              >
                <span className="cp-alert-row__dot" style={{ background: tone.dot }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: tone.title }}>
                    {alert.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--cp-text)', marginTop: 2 }}>
                    {alert.detail}
                  </div>
                </div>
                <span className="cp-mono" style={{ fontSize: 12, color: 'var(--cp-text-sub)' }}>
                  {alert.time}
                </span>
              </div>
            )
          })}
        </div>
        <div className="cp-modal__foot">
          <button type="button" className="cp-text-btn" onClick={onClose}>
            Dismiss
          </button>
          <button type="button" className="cp-refresh" onClick={onClose}>
            Acknowledge all
          </button>
        </div>
      </div>
    </div>
  )
}
