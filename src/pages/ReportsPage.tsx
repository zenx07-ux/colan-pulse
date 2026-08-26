import { useMemo, useState, type ReactNode } from 'react'
import {
  EuiButton,
  EuiButtonIcon,
  EuiCheckbox,
  EuiFieldNumber,
  EuiFieldText,
  EuiForm,
  EuiIcon,
  EuiSelect,
  EuiSwitch,
} from '@elastic/eui'
import { CreateReportDrawer } from '../components/CreateReportDrawer'
import { FormField } from '../components/FormField'
import { PageHeading } from '../components/PageHeading'
import {
  SECURITY_MODES,
  scheduledReports,
  smtpDefaults,
  type ScheduledReport,
} from '../data/reports'

const DAILY_PAGE_SIZE = 2

export function ReportsPage() {
  const [smtp, setSmtp] = useState(smtpDefaults)
  const [reports, setReports] = useState(scheduledReports)
  const [dailyPage, setDailyPage] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)

  const daily = useMemo(
    () => reports.filter((item) => item.cadence === 'daily'),
    [reports],
  )
  const weekly = useMemo(
    () => reports.filter((item) => item.cadence === 'weekly'),
    [reports],
  )
  const overnight = useMemo(
    () => reports.filter((item) => item.cadence === 'overnight'),
    [reports],
  )

  const dailyPages = Math.max(1, Math.ceil(daily.length / DAILY_PAGE_SIZE))
  const safeDailyPage = Math.min(dailyPage, dailyPages - 1)
  const dailySlice = daily.slice(
    safeDailyPage * DAILY_PAGE_SIZE,
    safeDailyPage * DAILY_PAGE_SIZE + DAILY_PAGE_SIZE,
  )

  function toggleReport(id: string) {
    setReports((current) =>
      current.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    )
  }

  function removeReport(id: string) {
    setReports((current) => current.filter((item) => item.id !== id))
  }

  return (
    <section className="cp-page cp-report-page">
      <PageHeading
        title="Report Configuration"
        description="Configure automatic daily and weekly productivity reports."
        extra={
          <div className="cp-report-actions">
            <EuiButton size="s" color="success" iconType="email">
              Send Test Email
            </EuiButton>
            <EuiButton size="s" color="success" iconType="play" fill>
              Send Daily Now
            </EuiButton>
            <EuiButton size="s" color="primary" iconType="play" fill>
              Send Weekly Now
            </EuiButton>
            <EuiButton
              size="s"
              color="primary"
              iconType="plus"
              fill
              onClick={() => setCreateOpen(true)}
            >
              New Report
            </EuiButton>
          </div>
        }
      />

      <section className="cp-card cp-smtp-card">
        <div className="cp-smtp-card__head">
          <div className="cp-smtp-card__title">
            <EuiIcon type="email" size="s" />
            SMTP & Email Delivery
          </div>
          <span className={`cp-smtp-badge${smtp.enabled ? ' is-on' : ''}`}>
            {smtp.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>

        <div className="cp-smtp-layout">
          <EuiForm className="cp-smtp-form" css={{ margin: 0 }}>
            <div className="cp-smtp-grid">
              <FormField label="SMTP Host">
                <EuiFieldText
                  compressed
                  fullWidth
                  value={smtp.host}
                  onChange={(event) =>
                    setSmtp((current) => ({ ...current, host: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Port">
                <EuiFieldText
                  compressed
                  fullWidth
                  value={smtp.port}
                  onChange={(event) =>
                    setSmtp((current) => ({ ...current, port: event.target.value }))
                  }
                />
              </FormField>
              <FormField className="cp-smtp-span-2" label="Security Mode">
                <EuiSelect
                  compressed
                  fullWidth
                  options={SECURITY_MODES}
                  value={smtp.security}
                  onChange={(event) =>
                    setSmtp((current) => ({ ...current, security: event.target.value }))
                  }
                />
              </FormField>
              <FormField className="cp-smtp-span-2" label="Sender Name">
                <EuiFieldText
                  compressed
                  fullWidth
                  value={smtp.senderName}
                  onChange={(event) =>
                    setSmtp((current) => ({
                      ...current,
                      senderName: event.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="Connection Timeout (seconds)">
                <EuiFieldNumber
                  compressed
                  fullWidth
                  value={Number(smtp.timeoutSeconds)}
                  onChange={(event) =>
                    setSmtp((current) => ({
                      ...current,
                      timeoutSeconds: event.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="Retry Count">
                <EuiFieldNumber
                  compressed
                  fullWidth
                  value={Number(smtp.retryCount)}
                  onChange={(event) =>
                    setSmtp((current) => ({
                      ...current,
                      retryCount: event.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField className="cp-smtp-span-2" label="Scheduler Retry Backoff (minutes)">
                <EuiFieldNumber
                  compressed
                  fullWidth
                  value={Number(smtp.backoffMinutes)}
                  onChange={(event) =>
                    setSmtp((current) => ({
                      ...current,
                      backoffMinutes: event.target.value,
                    }))
                  }
                />
              </FormField>
            </div>

            <div className="cp-smtp-enable">
              <EuiCheckbox
                id="smtp-enable-email"
                checked={smtp.enabled}
                label="Enable Email (scheduled & manual sends)"
                onChange={(event) =>
                  setSmtp((current) => ({ ...current, enabled: event.target.checked }))
                }
              />
              <p className="cp-card-sub">
                Username/Password are managed server-side (appsettings/environment variables)
                and are never shown or editable here.
              </p>
            </div>

            <EuiButton size="s" color="primary" fill>
              Save SMTP Settings
            </EuiButton>
          </EuiForm>

          <aside className="cp-smtp-status">
            <StatusBlock label="Last Connection Test" value={smtp.lastConnectionTest} />
            <StatusBlock label="Last Successful Email" value={smtp.lastSuccessfulEmail} />
            <StatusBlock
              label="Last Failed Email"
              value={smtp.lastFailedEmail}
              tone="danger"
            />
            <StatusBlock
              label="Last Scheduler Execution"
              value={smtp.lastSchedulerExecution}
            />
            <EuiButton size="s" iconType="wrench">
              Test SMTP Connection
            </EuiButton>
            <p className="cp-card-sub">
              Tests DNS + TCP + TLS/STARTTLS only — never authenticates with stored
              credentials.
            </p>
          </aside>
        </div>
      </section>

      <ReportSection
        icon="calendar"
        title="Daily Reports"
        items={dailySlice}
        onToggle={toggleReport}
        onRemove={removeReport}
        footer={
          <div className="cp-pager cp-report-pager">
            <span className="cp-pager__label">
              Page {safeDailyPage + 1} of {dailyPages}
            </span>
            <div className="cp-pager__actions">
              <button
                type="button"
                className="cp-page-btn"
                disabled={safeDailyPage <= 0}
                aria-label="Previous page"
                onClick={() => setDailyPage((page) => Math.max(0, page - 1))}
              >
                ‹
              </button>
              {Array.from({ length: dailyPages }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`cp-page-btn${safeDailyPage === index ? ' is-active' : ''}`}
                  aria-label={`Page ${index + 1}`}
                  aria-current={safeDailyPage === index ? 'page' : undefined}
                  onClick={() => setDailyPage(index)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                type="button"
                className="cp-page-btn"
                disabled={safeDailyPage >= dailyPages - 1}
                aria-label="Next page"
                onClick={() =>
                  setDailyPage((page) => Math.min(dailyPages - 1, page + 1))
                }
              >
                ›
              </button>
            </div>
          </div>
        }
      />

      <ReportSection
        icon="calendar"
        title="Weekly Reports"
        items={weekly}
        onToggle={toggleReport}
        onRemove={removeReport}
      />

      <ReportSection
        icon="moon"
        title="Overnight Idle Reports"
        subtitle="Employees whose system has stayed continuously idle/locked from before last evening through this morning."
        items={overnight}
        onToggle={toggleReport}
        onRemove={removeReport}
      />

      {createOpen ? (
        <CreateReportDrawer
          onClose={() => setCreateOpen(false)}
          onCreate={(report) => {
            setReports((current) => [report, ...current])
            if (report.cadence === 'daily') setDailyPage(0)
          }}
        />
      ) : null}
    </section>
  )
}

function StatusBlock({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'danger'
}) {
  return (
    <div className="cp-smtp-status__block">
      <div className="cp-smtp-status__label">{label}</div>
      <div
        className={`cp-smtp-status__value${tone === 'danger' ? ' is-danger' : ''}`}
      >
        {value}
      </div>
    </div>
  )
}

function ReportSection({
  icon,
  title,
  subtitle,
  items,
  onToggle,
  onRemove,
  footer,
}: {
  icon: 'calendar' | 'moon'
  title: string
  subtitle?: string
  items: ScheduledReport[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  footer?: ReactNode
}) {
  return (
    <section className="cp-card cp-report-section">
      <div className="cp-report-section__head">
        <h2 className="cp-card-title cp-report-section__title">
          <EuiIcon type={icon} size="s" />
          {title}
        </h2>
        {subtitle ? <p className="cp-card-sub">{subtitle}</p> : null}
      </div>
      <div className="cp-report-list">
        {items.map((item) => (
          <ReportCard
            key={item.id}
            report={item}
            onToggle={() => onToggle(item.id)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>
      {footer}
    </section>
  )
}

function ReportCard({
  report,
  onToggle,
  onRemove,
}: {
  report: ScheduledReport
  onToggle: () => void
  onRemove: () => void
}) {
  return (
    <article className="cp-report-card">
      <span className={`cp-report-scope cp-report-scope--${report.scope}`}>
        {report.scope === 'department' ? 'DEPARTMENT' : 'ORGANIZATION'}
      </span>
      <div className="cp-report-card__body">
        <h3 className="cp-report-card__title">{report.title}</h3>
        <div className="cp-report-card__meta">
          <span>
            <EuiIcon type="user" size="s" />
            {report.recipients}
          </span>
          <span>
            <EuiIcon type="clock" size="s" />
            {report.schedule}
          </span>
          <span>
            <EuiIcon type="calendar" size="s" />
            Next: {report.nextSend}
          </span>
          <span className={report.lastSendOk ? 'is-ok' : 'is-bad'}>
            <EuiIcon type={report.lastSendOk ? 'check' : 'warning'} size="s" />
            {report.lastSendOk ? 'Last send OK' : 'Last send failed'}
          </span>
        </div>
      </div>
      <div className="cp-report-card__actions">
        <EuiSwitch
          compressed
          label={report.enabled ? 'On' : 'Off'}
          showLabel={false}
          checked={report.enabled}
          onChange={onToggle}
          aria-label={`Toggle ${report.title}`}
        />
        <EuiButtonIcon
          iconType="eye"
          size="s"
          color="text"
          aria-label={`View ${report.title}`}
        />
        <EuiButtonIcon
          iconType="play"
          size="s"
          color="success"
          aria-label={`Run ${report.title}`}
        />
        <EuiButtonIcon
          iconType="clock"
          size="s"
          color="text"
          aria-label={`History for ${report.title}`}
        />
        <EuiButtonIcon
          iconType="pencil"
          size="s"
          color="primary"
          aria-label={`Edit ${report.title}`}
        />
        <EuiButtonIcon
          iconType="trash"
          size="s"
          color="danger"
          aria-label={`Delete ${report.title}`}
          onClick={onRemove}
        />
      </div>
    </article>
  )
}
