import { useMemo, useState } from 'react'
import {
  EuiButton,
  EuiCheckbox,
  EuiFieldText,
  EuiForm,
  EuiIcon,
  EuiSelect,
  EuiTextArea,
} from '@elastic/eui'
import { FormField } from './FormField'
import { DEPARTMENT_FUNCTIONS, departmentRecords } from '../data/departments'
import { employees } from '../data/employees'
import type { ReportCadence, ReportScope, ScheduledReport } from '../data/reports'

const REPORT_TYPES = [
  { value: 'daily', text: 'Daily' },
  { value: 'weekly', text: 'Weekly' },
  { value: 'overnight', text: 'Overnight Idle' },
]

const SCOPE_OPTIONS = [
  { value: 'department', text: 'Department (Team Lead)' },
  { value: 'organization', text: 'Organization' },
]

const RECIPIENT_MODES = [
  { value: 'custom', text: 'Custom - static list of email addresses' },
  { value: 'managers', text: 'All managers in scope' },
  { value: 'team-leads', text: 'All team leads in scope' },
]

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort()
}

export function CreateReportDrawer({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (report: ScheduledReport) => void
}) {
  const [reportType, setReportType] = useState<ReportCadence>('daily')
  const [scope, setScope] = useState<ReportScope>('department')
  const [department, setDepartment] = useState('')
  const [functions, setFunctions] = useState<Set<string>>(new Set())
  const [teamLead, setTeamLead] = useState('')
  const [recipientMode, setRecipientMode] = useState('custom')
  const [emails, setEmails] = useState('tl@company.com, manager@company.com')
  const [scheduleTime, setScheduleTime] = useState('18:00')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [preview, setPreview] = useState<string[] | null>(null)

  const departmentOptions = useMemo(
    () => [
      { value: '', text: '-- Select Department --' },
      ...departmentRecords.map((item) => ({ value: item.name, text: item.name })),
    ],
    [],
  )

  const teamLeadOptions = useMemo(() => {
    const leads = unique(employees.map((item) => item.teamLead))
    return [
      { value: '', text: '-- None (use Recipients below) --' },
      ...leads.map((name) => ({ value: name, text: name })),
    ]
  }, [])

  function toggleFunction(name: string) {
    setFunctions((current) => {
      const next = new Set(current)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function formatScheduleLabel() {
    const [hours, minutes] = scheduleTime.split(':').map(Number)
    const date = new Date()
    date.setHours(hours || 0, minutes || 0, 0, 0)
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    if (reportType === 'weekly') return `Every Monday at ${time}`
    if (reportType === 'overnight') return `Weekdays at ${time}`
    return `${time} daily`
  }

  function previewRecipients() {
    if (teamLead) {
      setPreview([`${teamLead.toLowerCase().replace(/\s+/g, '.')}@colan.com`])
      return
    }
    const list = emails
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    setPreview(list.length ? list : ['No recipients resolved'])
  }

  function handleCreate() {
    if (scope === 'department' && !department) return
    if (!teamLead && !emails.trim()) return

    const title =
      description.trim() ||
      (scope === 'organization'
        ? 'All Departments'
        : functions.size > 0
          ? `${department} - ${Array.from(functions).slice(0, 3).join(', ')}`
          : department || 'New Report')

    onCreate({
      id: `report-${Date.now()}`,
      cadence: reportType,
      scope,
      title,
      recipients: teamLead || emails.trim(),
      schedule: formatScheduleLabel(),
      nextSend: reportType === 'weekly' ? 'Mon, ' + scheduleTime : 'Tomorrow, ' + scheduleTime,
      lastSendOk: true,
      enabled: active,
    })
    onClose()
  }

  return (
    <div className="cp-overlay" onClick={onClose} role="presentation">
      <aside
        className="cp-drawer cp-drawer--report"
        role="dialog"
        aria-labelledby="create-report-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cp-drawer__head">
          <div className="cp-drawer__head-copy">
            <div className="cp-drawer__title" id="create-report-title">
              Create New Report
            </div>
          </div>
          <button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cp-drawer__body cp-report-drawer__body">
          <EuiForm css={{ margin: 0 }}>
            <div className="cp-report-drawer__row2">
              <FormField label="Report Type *" fullWidth>
                <EuiSelect
                  compressed
                  fullWidth
                  options={REPORT_TYPES}
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value as ReportCadence)}
                />
              </FormField>
              <FormField label="Scope *" fullWidth>
                <EuiSelect
                  compressed
                  fullWidth
                  options={SCOPE_OPTIONS}
                  value={scope}
                  onChange={(event) => setScope(event.target.value as ReportScope)}
                />
              </FormField>
            </div>

            {scope === 'department' ? (
              <FormField label="Department *" fullWidth>
                <EuiSelect
                  compressed
                  fullWidth
                  options={departmentOptions}
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                />
              </FormField>
            ) : null}

            <FormField
              label="Function (optional filter - click to select multiple, no Ctrl/Cmd needed)"
              helpText="Narrows the scope above to only employees tagged with any of the checked Functions — e.g. 'Software Development department, .NET or Angular'. Leave nothing checked for all Functions."
              fullWidth
            >
              <div className="cp-report-fn-list" role="group" aria-label="Functions">
                {DEPARTMENT_FUNCTIONS.map((name) => (
                  <label key={name} className="cp-report-fn-item">
                    <span>{name}</span>
                    <EuiCheckbox
                      id={`report-fn-${name}`}
                      checked={functions.has(name)}
                      onChange={() => toggleFunction(name)}
                    />
                  </label>
                ))}
              </div>
            </FormField>

            <FormField
              label="Team Lead (optional - send to one specific person)"
              helpText="Picking a Team Lead here sends this report to them alone, containing only their own people (Department/Function above further narrows which of their people are included) — Recipients below is then ignored."
              fullWidth
            >
              <EuiSelect
                compressed
                fullWidth
                options={teamLeadOptions}
                value={teamLead}
                onChange={(event) => setTeamLead(event.target.value)}
              />
            </FormField>

            <FormField label="Recipients *" fullWidth>
              <EuiSelect
                compressed
                fullWidth
                options={RECIPIENT_MODES}
                value={recipientMode}
                onChange={(event) => setRecipientMode(event.target.value)}
                disabled={Boolean(teamLead)}
              />
            </FormField>

            {recipientMode === 'custom' && !teamLead ? (
              <FormField label="Recipient Emails (comma-separated) *" fullWidth>
                <EuiTextArea
                  compressed
                  fullWidth
                  rows={3}
                  value={emails}
                  onChange={(event) => setEmails(event.target.value)}
                  placeholder="tl@company.com, manager@company.com"
                />
              </FormField>
            ) : null}

            <div className="cp-report-preview">
              <EuiButton size="s" iconType="search" onClick={previewRecipients}>
                Preview Recipients
              </EuiButton>
              <p className="cp-card-sub">
                Shows exactly who this configuration would send to right now, without saving
                anything.
              </p>
              {preview ? (
                <ul className="cp-report-preview__list">
                  {preview.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <FormField label="Schedule Time *" fullWidth>
              <EuiFieldText
                compressed
                fullWidth
                type="time"
                value={scheduleTime}
                onChange={(event) => setScheduleTime(event.target.value)}
                append={<EuiIcon type="clock" size="s" />}
              />
            </FormField>

            <FormField label="Description (optional)" fullWidth>
              <EuiFieldText
                compressed
                fullWidth
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Daily report for DotNet team TL"
              />
            </FormField>

            <EuiCheckbox
              id="report-active"
              checked={active}
              label="Active (report will be sent automatically)"
              onChange={(event) => setActive(event.target.checked)}
            />
          </EuiForm>
        </div>

        <div className="cp-drawer__foot cp-report-drawer__foot">
          <div />
          <div className="cp-report-drawer__foot-actions">
            <EuiButton size="s" onClick={onClose}>
              Cancel
            </EuiButton>
            <EuiButton size="s" fill color="primary" onClick={handleCreate}>
              Create
            </EuiButton>
          </div>
        </div>
      </aside>
    </div>
  )
}
