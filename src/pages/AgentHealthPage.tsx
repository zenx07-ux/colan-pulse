import { useState } from 'react'
import { EuiIcon } from '@elastic/eui'
import { PageHeading } from '../components/PageHeading'
import {
  agentErrors,
  agentHealthStats,
  agentLatestErrors,
  agentVersions,
} from '../data/agentHealth'
import type { AgentErrorSource, AgentLatestError } from '../types'

const VERSION_MAX = Math.max(...agentVersions.map((item) => item.count))

function formatErrorTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function AgentHealthPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <section className="cp-page cp-health-page">
      <PageHeading
        title="Agent Health"
        description="Fleet-wide agent status — refreshes automatically every 30 seconds."
      />

      <div className="cp-health-kpis">
        <Stat value={agentHealthStats.online} label="Online" tone="var(--cp-success-text)" />
        <Stat value={agentHealthStats.offline} label="Offline" tone="var(--cp-text-sub)" />
        <Stat value={agentHealthStats.healthy} label="Healthy" tone="var(--cp-success-text)" />
        <Stat value={agentHealthStats.warning} label="Warning" tone="var(--cp-warning-text)" />
        <Stat value={agentHealthStats.error} label="Error" tone="var(--cp-danger-text)" />
        <Stat value={agentHealthStats.avgCpu} label="Avg CPU (online)" />
        <Stat value={agentHealthStats.avgMemory} label="Avg memory (online)" />
      </div>

      <div className="cp-health-charts">
        <section className="cp-card">
          <div className="cp-card-head">
            <div className="cp-card-title">Version Distribution</div>
          </div>
          <div className="cp-health-versions">
            {agentVersions.map((item) => (
              <div key={item.version} className="cp-health-version">
                <span className="cp-health-version__label">{item.version}</span>
                <div className="cp-bar-track">
                  <div
                    className="cp-bar-fill"
                    style={{
                      width: `${(item.count / VERSION_MAX) * 100}%`,
                      background: 'var(--cp-primary)',
                    }}
                  />
                </div>
                <span className="cp-health-version__count">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="cp-card">
          <div className="cp-card-head">
            <div className="cp-card-title">Repeated Errors (last 24h, grouped)</div>
          </div>
          <div className="cp-health-errors">
            {agentErrors.map((item) => (
              <article key={item.id} className="cp-error-row">
                <div className="cp-error-row__head">
                  <span className="cp-sev cp-sev--high">ERROR</span>
                  <span className="cp-error-name">{item.name}</span>
                  <span className="cp-error-cat">{item.category}</span>
                  <span className="cp-error-count">x{item.count}</span>
                </div>
                <p className="cp-error-detail">{item.detail}</p>
                <div className="cp-card-sub">Last on {item.lastHost}</div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="cp-card cp-health-latest">
        <div className="cp-card-head">
          <div className="cp-card-title">Latest Errors</div>
        </div>
        <div className="cp-health-latest__list">
          {agentLatestErrors.map((item) => (
            <LatestErrorRow
              key={item.id}
              item={item}
              open={expanded === item.id}
              onToggle={() =>
                setExpanded((current) => (current === item.id ? null : item.id))
              }
            />
          ))}
        </div>
      </section>
    </section>
  )
}

function Stat({
  value,
  label,
  tone,
}: {
  value: string | number
  label: string
  tone?: string
}) {
  return (
    <div className="cp-card cp-incident-kpi">
      <div className="cp-incident-kpi__value" style={tone ? { color: tone } : undefined}>
        {value}
      </div>
      <div className="cp-incident-kpi__label">{label}</div>
    </div>
  )
}

function LatestErrorRow({
  item,
  open,
  onToggle,
}: {
  item: AgentLatestError
  open: boolean
  onToggle: () => void
}) {
  return (
    <article className={`cp-latest-error${open ? ' is-open' : ''}`}>
      <button type="button" className="cp-latest-error__toggle" onClick={onToggle}>
        <div className="cp-latest-error__main">
          <div className="cp-latest-error__badges">
            <span className="cp-sev cp-sev--high">ERROR</span>
            <SourceBadge source={item.source} />
          </div>
          <div className="cp-latest-error__body">
            <div className="cp-latest-error__title">
              <span className="cp-latest-error__name">{item.name}</span>
              <span className="cp-latest-error__link">
                {item.employee} ({item.device})
              </span>
            </div>
            <p className="cp-latest-error__detail">{item.detail}</p>
            <div className="cp-latest-error__meta">
              {item.host} v{item.version}
            </div>
            {open ? (
              <div className="cp-latest-error__extra">
                Source: {item.source.toUpperCase()} · Host {item.host} · Agent {item.version}
              </div>
            ) : null}
          </div>
          <time className="cp-latest-error__time" dateTime={item.occurredAt}>
            {formatErrorTime(item.occurredAt)}
          </time>
          <EuiIcon type={open ? 'arrowDown' : 'arrowRight'} size="s" />
        </div>
      </button>
    </article>
  )
}

function SourceBadge({ source }: { source: AgentErrorSource }) {
  return (
    <span className={`cp-source-pill cp-source-pill--${source}`}>
      {source.toUpperCase()}
    </span>
  )
}
