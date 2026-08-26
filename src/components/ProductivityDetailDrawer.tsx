import { useEffect, useMemo, useState } from 'react'
import { EuiButton, EuiIcon, EuiProgress } from '@elastic/eui'
import { formatHms, seededSeconds } from '../utils/format'
import type { Employee } from '../types'

const APP_CATALOG = [
  { name: 'Unknown Browsing', ai: false },
  { name: 'ms-teams', ai: false },
  { name: 'claude.ai', ai: true },
  { name: 'chatgpt.com', ai: true },
  { name: 'explorer', ai: false },
  { name: 'writehuman.ai', ai: true },
  { name: 'vscode', ai: false },
  { name: 'outlook.office.com', ai: false },
  { name: 'github.com', ai: false },
  { name: 'figma', ai: false },
  { name: 'jira.atlassian.com', ai: false },
  { name: 'notion.so', ai: false },
] as const

const DONUT_COLORS = ['#1f4db8', '#2f6fed', '#4f8cff', '#7aa7ff', '#a8c5ff', '#c9daff']

function seedMod(seed: string, mod: number) {
  return seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % mod
}

function clockFromSeed(seed: string, baseHour: number) {
  const hour = baseHour + seedMod(seed, 3)
  const minute = seedMod(seed.split('').reverse().join(''), 60)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function formatCompact(totalSeconds: number) {
  const safe = Math.max(0, Math.round(totalSeconds))
  if (safe < 60) return `${safe}s`
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}

function productivityPct(employee: Employee) {
  return Math.min(99.9, employee.score + seedMod(employee.id, 100) / 10)
}

function buildAppUsage(employee: Employee) {
  const workSeconds = seededSeconds(Math.max(0, 480 - employee.idleMinutes), employee.id)
  const count = 6 + seedMod(employee.id, 7)
  const picked = APP_CATALOG.slice(0, count).map((app, index) => {
    const weight = Math.max(4, 38 - index * 5 - seedMod(employee.id + app.name, 4))
    return { ...app, weight }
  })
  const totalWeight = picked.reduce((sum, item) => sum + item.weight, 0) || 1
  return picked.map((item) => ({
    name: item.name,
    ai: item.ai,
    seconds: Math.round((item.weight / totalWeight) * workSeconds),
    share: (item.weight / totalWeight) * 100,
  }))
}

export function ProductivityDetailDrawer({
  employee,
  onClose,
}: {
  employee: Employee
  onClose: () => void
}) {
  const [aiOpen, setAiOpen] = useState(false)
  const online = employee.status !== 'offline'
  const workSeconds = seededSeconds(Math.max(0, 480 - employee.idleMinutes), employee.id)
  const idleSeconds = seededSeconds(employee.idleMinutes, employee.name)
  const firstIn = clockFromSeed(employee.id, 9)
  const lastOut = clockFromSeed(employee.name, 17)
  const productivity = productivityPct(employee)
  const aiSeconds = Math.round(((employee.aiUsage ?? 0) / 100) * Math.max(workSeconds, 1))
  const deviceId = `CIPL-ATC${String(479 + seedMod(employee.id, 900)).padStart(5, '0')}`
  const apps = useMemo(() => buildAppUsage(employee), [employee])
  const timelineSeconds = workSeconds + idleSeconds
  const missingSeconds = Math.max(0, seedMod(employee.id, 420))
  const donutTotal = apps.reduce((sum, app) => sum + app.seconds, 0)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="cp-overlay cp-overlay--soft" onClick={onClose} role="presentation">
      <aside
        className="cp-drawer cp-drawer--prod"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prod-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cp-prod-drawer__head">
          <div className="cp-prod-drawer__identity">
            <h2 className="cp-prod-drawer__title" id="prod-drawer-title">
              {employee.name}
            </h2>
            <p className="cp-prod-drawer__sub">
              {employee.id} • {employee.role}
            </p>
          </div>
          <div className="cp-prod-drawer__actions">
            <EuiButton size="s" color="primary" fill iconType="download">
              Export Report
            </EuiButton>
            <button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}>
              <EuiIcon type="cross" size="m" />
            </button>
          </div>
        </header>

        <div className="cp-prod-drawer__body">
          <div className="cp-prod-grid cp-prod-grid--6">
            <MetricCard label="First In" value={firstIn} tone="info" />
            <MetricCard label="Last Out" value={lastOut} tone="info" />
            <MetricCard label="Work Hours" value={formatHms(workSeconds)} tone="success" mono />
            <MetricCard label="Idle / Away" value={formatHms(idleSeconds)} tone="warning" mono />
            <MetricCard label="Productivity" value={`${productivity.toFixed(1)}%`} tone="info" />
            <MetricCard
              label="AI Usage"
              value={`${(employee.aiUsage ?? 0).toFixed(2)}%`}
              sub={formatCompact(aiSeconds)}
              tone="ai"
            />
          </div>

          <div className="cp-prod-grid cp-prod-grid--6">
            <AccentCard label="Productive" value={formatCompact(workSeconds)} tone="success" />
            <AccentCard label="Unproductive" value="0s" tone="danger" />
            <AccentCard label="Neutral" value="0s" tone="neutral" />
            <AccentCard label="Meeting" value="0s" tone="info" />
            <MetricCard label="Timeline" value={formatCompact(timelineSeconds)} tone="success" />
            <MetricCard label="Missing" value={formatCompact(missingSeconds)} tone="danger" />
          </div>

          <div className="cp-prod-columns">
            <section className="cp-prod-section">
              <h3 className="cp-prod-section__title">
                <EuiIcon type="desktop" size="s" />
                Multi-Device Activity
              </h3>
              <div className="cp-prod-grid cp-prod-grid--3">
                <MiniStat label="Active Devices" value="1" />
                <MiniStat label="Concurrent Usage" value="0s" />
                <MiniStat label="Current Active Device" value={deviceId} accent />
              </div>
              <div className="cp-prod-grid cp-prod-grid--2">
                <div className="cp-prod-list-card">
                  <div className="cp-prod-list-card__label">Device Wise Time</div>
                  <div className="cp-prod-list-card__row">
                    <EuiIcon type="desktop" size="s" />
                    <span className="cp-prod-list-card__text cp-mono">{deviceId}</span>
                    <strong>{formatCompact(workSeconds)}</strong>
                  </div>
                </div>
                <div className="cp-prod-list-card">
                  <div className="cp-prod-list-card__label">Project Wise Time</div>
                  <div className="cp-prod-list-card__row">
                    <EuiIcon type="folderOpen" size="s" />
                    <span className="cp-prod-list-card__text">Unassigned</span>
                    <strong>{formatCompact(workSeconds)}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="cp-prod-section">
              <h3 className="cp-prod-section__title">
                <EuiIcon type="stats" size="s" />
                Time Distribution
              </h3>
              <div className="cp-prod-donut">
                <Donut
                  slices={apps.slice(0, 6).map((app, index) => ({
                    share: app.share,
                    color: DONUT_COLORS[index % DONUT_COLORS.length],
                  }))}
                  center={formatCompact(donutTotal || timelineSeconds)}
                />
                <ul className="cp-prod-donut__legend">
                  {apps.slice(0, 6).map((app, index) => (
                    <li key={app.name}>
                      <span
                        className="cp-prod-donut__dot"
                        style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
                      />
                      <span className="cp-prod-donut__name">{app.name}</span>
                      <span className="cp-mono">{formatCompact(app.seconds)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div className="cp-prod-columns">
            <section className="cp-prod-section">
              <h3 className="cp-prod-section__title">
                <EuiIcon type="apps" size="s" />
                Application Usage Breakdown
              </h3>
              <div className="cp-prod-apps cp-prod-apps--wide">
                {apps.map((app) => (
                  <article key={app.name} className="cp-prod-app">
                    <div className="cp-prod-app__top">
                      <span className="cp-prod-app__name">{app.name}</span>
                      <span className="cp-mono cp-prod-app__time">{formatCompact(app.seconds)}</span>
                    </div>
                    <div className="cp-prod-app__bar">
                      <EuiProgress value={app.share} max={100} size="s" color="primary" />
                      <div className="cp-prod-app__tags">
                        <span className="cp-prod-tag cp-prod-tag--ok">Productive</span>
                        {app.ai ? <span className="cp-prod-tag cp-prod-tag--ai">AI</span> : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div className="cp-prod-side-stack">
              <section className="cp-prod-section">
                <h3 className="cp-prod-section__title">
                  <EuiIcon type="user" size="s" color="primary" />
                  Employee Info
                </h3>
                <div className="cp-prod-grid cp-prod-grid--2">
                  <InfoCard label="Email" value={employee.email} />
                  <InfoCard label="Department" value={employee.department || '—'} />
                  <InfoCard label="Total Apps Used" value={String(apps.length)} />
                  <div className="cp-prod-info">
                    <div className="cp-prod-info__label">Status</div>
                    <span
                      className={`cp-status ${online ? 'cp-status--active' : 'cp-status--offline'}`}
                    >
                      <span className="cp-status__dot" />
                      {online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </section>

              <section className="cp-prod-section cp-prod-section--ai">
                <button
                  type="button"
                  className="cp-prod-ai-toggle"
                  aria-expanded={aiOpen}
                  onClick={() => setAiOpen((open) => !open)}
                >
                  <span className="cp-prod-section__title">
                    <EuiIcon type="sparkles" size="s" />
                    AI Insights
                  </span>
                  <EuiIcon type={aiOpen ? 'sortUp' : 'arrowDown'} size="s" />
                </button>
                {aiOpen ? (
                  <p className="cp-prod-ai-copy">
                    AI tools accounted for {(employee.aiUsage ?? 0).toFixed(2)}% of tracked work
                    time today ({formatCompact(aiSeconds)}).
                  </p>
                ) : null}
              </section>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function MetricCard({
  label,
  value,
  sub,
  tone,
  mono,
}: {
  label: string
  value: string
  sub?: string
  tone: 'success' | 'warning' | 'info' | 'danger' | 'ai'
  mono?: boolean
}) {
  return (
    <div className={`cp-prod-metric cp-prod-metric--${tone}`}>
      <div className="cp-prod-metric__label">{label}</div>
      <div className={`cp-prod-metric__value${mono ? ' cp-mono' : ''}`}>{value}</div>
      {sub ? <div className="cp-prod-metric__sub">{sub}</div> : null}
    </div>
  )
}

function AccentCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'success' | 'danger' | 'neutral' | 'info'
}) {
  return (
    <div className={`cp-prod-accent cp-prod-accent--${tone}`}>
      <div className="cp-prod-metric__label">{label}</div>
      <div className="cp-prod-metric__value">{value}</div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="cp-prod-mini">
      <div className="cp-prod-metric__label">{label}</div>
      <div className={`cp-prod-mini__value${accent ? ' is-accent' : ''}`}>{value}</div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="cp-prod-info">
      <div className="cp-prod-info__label">{label}</div>
      <div className="cp-prod-info__value">{value}</div>
    </div>
  )
}

function Donut({
  slices,
  center,
}: {
  slices: Array<{ share: number; color: string }>
  center: string
}) {
  const radius = 15.9
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="cp-prod-donut__svg-wrap">
      <svg viewBox="0 0 42 42" width="148" height="148" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="21"
          cy="21"
          r={radius}
          fill="none"
          stroke="var(--cp-disabled-bg)"
          strokeWidth="5"
        />
        {slices.map((slice, index) => {
          const length = (slice.share / 100) * circumference
          const dash = `${length} ${circumference - length}`
          const currentOffset = -offset
          offset += length
          return (
            <circle
              key={`${slice.color}-${index}`}
              cx="21"
              cy="21"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="5"
              strokeDasharray={dash}
              strokeDashoffset={currentOffset}
            />
          )
        })}
      </svg>
      <div className="cp-prod-donut__center">
        <span>Total</span>
        <strong>{center}</strong>
      </div>
    </div>
  )
}
