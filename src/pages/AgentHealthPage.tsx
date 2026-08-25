import { agentErrors, agentHealthStats, agentVersions } from '../data/agentHealth'

const VERSION_MAX = Math.max(...agentVersions.map((item) => item.count))

export function AgentHealthPage() {
  return (
    <section className="cp-health-page">
      <div className="cp-incident-head">
        <div className="cp-page-lead">
          <h1 className="cp-activity-title">Agent Health</h1>
          <div className="cp-card-sub">
            Fleet-wide agent status — refreshes automatically every 30 seconds.
          </div>
        </div>
      </div>

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
                <span className="cp-mono">{item.version}</span>
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
