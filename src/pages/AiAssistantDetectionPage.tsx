import { useEffect, useMemo, useRef, useState } from 'react'
import {
  EuiButton,
  EuiCheckbox,
  EuiDatePicker,
  EuiFieldText,
  EuiForm,
  EuiIcon,
  EuiSwitch,
  EuiTextArea,
} from '@elastic/eui'
import type { Moment } from 'moment'
import moment from 'moment'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { FormField } from '../components/FormField'
import { PageHeading } from '../components/PageHeading'
import { aiAssistantTools as seedTools, aiDiagnosticCaptures } from '../data/aiAssistants'
import { employees } from '../data/employees'
import type { AiAssistantTool, AiDiagnosticCapture, AiTestConfidence } from '../types'

type TabId = 'rules' | 'diagnostics' | 'test'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'rules', label: 'Rules' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'test', label: 'Test' },
]

const PAGE_DESCRIPTION =
  'Configure and validate detection of AI assistants that run as a background process inside an IDE (e.g. GitHub Copilot) — separate from standalone AI apps/sites, which are handled on the Categories screen.'

function requiredLabel(label: string) {
  return (
    <>
      {label} <span className="cp-req">*</span>
    </>
  )
}

function emptyTool(): AiAssistantTool {
  return {
    id: `tool-${Date.now()}`,
    name: '',
    processNames: [],
    executableNames: [],
    enabled: true,
    notes: '',
  }
}

function splitNames(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function joinNames(values: string[]) {
  return values.join(', ')
}

function confidenceTone(value: AiTestConfidence) {
  if (value === 'High') return 'cp-status--active'
  if (value === 'Medium') return 'cp-status--idle'
  return 'cp-status--offline'
}

export function AiAssistantDetectionPage() {
  const [tab, setTab] = useState<TabId>('rules')
  const [tools, setTools] = useState(seedTools)
  const [diagnosticsOn, setDiagnosticsOn] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [draft, setDraft] = useState<AiAssistantTool | null>(null)
  const [isCreate, setIsCreate] = useState(true)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | null>(null)

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 4000)
  }

  function openCreate() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setIsCreate(true)
    setClosing(false)
    setDraft(emptyTool())
  }

  function openEdit(item: AiAssistantTool) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setIsCreate(false)
    setClosing(false)
    setDraft({ ...item })
  }

  function closeDrawer() {
    if (!draft || closing) return
    setClosing(true)
    closeTimer.current = window.setTimeout(() => {
      setDraft(null)
      setClosing(false)
      closeTimer.current = null
    }, 200)
  }

  function saveTool(next: AiAssistantTool) {
    setTools((current) => {
      const exists = current.some((item) => item.id === next.id)
      return exists
        ? current.map((item) => (item.id === next.id ? next : item))
        : [next, ...current]
    })
    showNotice(isCreate ? `Added ${next.name}.` : `Updated ${next.name}.`)
    closeDrawer()
  }

  function removeTool(item: AiAssistantTool) {
    const confirmed = window.confirm(`Delete the detection rule for ${item.name}?`)
    if (!confirmed) return
    setTools((current) => current.filter((tool) => tool.id !== item.id))
    showNotice(`Deleted ${item.name}.`)
  }

  const columns: Array<DataTableColumn<AiAssistantTool>> = [
    {
      id: 'name',
      label: 'AI Tool',
      width: '18%',
      sortValue: (item) => item.name,
      render: (item) => (
        <strong style={{ color: 'var(--cp-heading)' }}>{item.name}</strong>
      ),
    },
    {
      id: 'process',
      label: 'Process Names',
      width: '22%',
      sortValue: (item) => joinNames(item.processNames),
      render: (item) => <span className="cp-mono">{joinNames(item.processNames)}</span>,
    },
    {
      id: 'exe',
      label: 'Executable Names',
      width: '22%',
      sortValue: (item) => joinNames(item.executableNames),
      render: (item) => (
        <span className="cp-mono">{joinNames(item.executableNames) || '—'}</span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      width: '12%',
      sortValue: (item) => (item.enabled ? 'Active' : 'Inactive'),
      render: (item) => (
        <span
          className={`cp-dept-status${item.enabled ? '' : ' cp-dept-status--inactive'}`}
        >
          {item.enabled ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      width: '16%',
      sortValue: (item) => item.notes,
      render: (item) => (
        <span className="cp-truncate" title={item.notes}>
          {item.notes || '—'}
        </span>
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      align: 'center',
      width: '88px',
      sortable: false,
      render: (item) => (
        <span className="cp-action-pair">
          <button
            type="button"
            className="cp-eye-btn"
            aria-label={`Edit ${item.name}`}
            onClick={(event) => {
              event.stopPropagation()
              openEdit(item)
            }}
          >
            <EuiIcon type="pencil" size="s" />
          </button>
          <button
            type="button"
            className="cp-eye-btn cp-eye-btn--danger"
            aria-label={`Delete ${item.name}`}
            onClick={(event) => {
              event.stopPropagation()
              removeTool(item)
            }}
          >
            <EuiIcon type="trash" size="s" />
          </button>
        </span>
      ),
    },
  ]

  return (
    <section className="cp-page">
      <PageHeading
        title="AI Assistant Detection"
        description={PAGE_DESCRIPTION}
        extra={
          tab === 'rules' ? (
            <EuiButton size="s" fill color="success" iconType="plus" onClick={openCreate}>
              Add Tool
            </EuiButton>
          ) : null
        }
      />

      <div className="cp-tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`cp-tab${tab === item.id ? ' is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'rules' ? (
        <>
          <section className="cp-card cp-detect-panel">
            <EuiSwitch
              label=""
              showLabel={false}
              checked={diagnosticsOn}
              onChange={(event) => setDiagnosticsOn(event.target.checked)}
              aria-label="AI Detection Diagnostics"
            />
            <div className="cp-detect-panel__copy">
              <div className="cp-detect-panel__title">AI Detection Diagnostics</div>
              <p className="cp-card-sub cp-detect-panel__hint">
                {diagnosticsOn
                  ? 'On — capturing background process names for a short validation run. Turn off when finished.'
                  : 'Off — meant for short validation runs, not permanent capture.'}
              </p>
            </div>
          </section>

          <section className="cp-card cp-master-table">
            <DataTable
              items={tools}
              columns={columns}
              getRowId={(item) => item.id}
              pageSize={8}
              defaultSort={{ id: 'name', direction: 'asc' }}
              empty="No AI assistant rules yet. Use Add Tool to create one."
            />
          </section>
        </>
      ) : null}

      {tab === 'diagnostics' ? (
        <DiagnosticsTab enabled={diagnosticsOn} />
      ) : null}

      {tab === 'test' ? <TestTab tools={tools} /> : null}

      {draft ? (
        <ToolDrawer
          key={draft.id}
          tool={draft}
          isCreate={isCreate}
          closing={closing}
          onClose={closeDrawer}
          onSave={saveTool}
        />
      ) : null}

      {notice ? (
        <div className="cp-toast" role="status">
          <EuiIcon type="check" size="s" color="success" />
          <span>{notice}</span>
        </div>
      ) : null}
    </section>
  )
}

function DiagnosticsTab({ enabled }: { enabled: boolean }) {
  const [employeeId, setEmployeeId] = useState('')
  const [from, setFrom] = useState<Moment | null>(null)
  const [to, setTo] = useState<Moment | null>(null)
  const [results, setResults] = useState<AiDiagnosticCapture[] | null>(null)
  const [searched, setSearched] = useState(false)

  const columns: Array<DataTableColumn<AiDiagnosticCapture>> = [
    {
      id: 'when',
      label: 'Captured at',
      sortValue: (item) => item.capturedAt,
      render: (item) => (
        <span className="cp-mono">{moment.utc(item.capturedAt).format('DD-MM-YYYY HH:mm')} UTC</span>
      ),
    },
    {
      id: 'employee',
      label: 'Employee',
      sortValue: (item) => item.employeeId,
      render: (item) => (
        <div className="cp-cell-stack">
          <strong style={{ color: 'var(--cp-heading)' }}>{item.employeeName}</strong>
          <span className="cp-emp-id">{item.employeeId}</span>
        </div>
      ),
    },
    {
      id: 'process',
      label: 'Process',
      sortValue: (item) => item.processName,
      render: (item) => <span className="cp-mono">{item.processName}</span>,
    },
    {
      id: 'exe',
      label: 'Executable',
      sortValue: (item) => item.executableName,
      render: (item) => <span className="cp-mono">{item.executableName}</span>,
    },
    {
      id: 'match',
      label: 'Matched tool',
      sortValue: (item) => item.matchedTool ?? '',
      render: (item) => item.matchedTool ?? '—',
    },
  ]

  function runSearch() {
    setSearched(true)
    if (!enabled) {
      setResults([])
      return
    }
    const id = employeeId.trim().toLowerCase()
    const next = aiDiagnosticCaptures.filter((item) => {
      if (id && item.employeeId.toLowerCase() !== id) return false
      const at = moment.utc(item.capturedAt)
      if (from && at.isBefore(from)) return false
      if (to && at.isAfter(to)) return false
      return true
    })
    setResults(next)
  }

  return (
    <>
      <p className="cp-card-sub cp-detect-copy">
        Compare captures with the assistant off vs on to discover/confirm the real background-process
        name — only populated while AI Detection Diagnostics is enabled above.
      </p>
      <div className="cp-detect-bar">
        <div className="cp-detect-bar__id">
          <EuiFieldText
            compressed
            fullWidth
            value={employeeId}
            placeholder="Employee ID (e.g. CIPL0799)"
            onChange={(event) => setEmployeeId(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') runSearch()
            }}
            aria-label="Employee ID"
          />
        </div>
        <div className="cp-detect-bar__date">
          <EuiDatePicker
            compressed
            fullWidth
            showTimeSelect
            selected={from}
            onChange={setFrom}
            onClear={() => setFrom(null)}
            placeholder="dd-mm-yyyy --:--"
            dateFormat="DD-MM-YYYY HH:mm"
            timeFormat="HH:mm"
          />
        </div>
        <div className="cp-detect-bar__date">
          <EuiDatePicker
            compressed
            fullWidth
            showTimeSelect
            selected={to}
            onChange={setTo}
            onClear={() => setTo(null)}
            placeholder="dd-mm-yyyy --:--"
            dateFormat="DD-MM-YYYY HH:mm"
            timeFormat="HH:mm"
            minDate={from ?? undefined}
          />
        </div>
        <EuiButton fill onClick={runSearch}>
          Search
        </EuiButton>
      </div>

      {!enabled ? (
        <div className="cp-callout cp-callout--info">
          <div className="cp-callout__body">
            Enable AI Detection Diagnostics on the Rules tab to populate captures. This is meant for
            short validation runs, not permanent capture.
          </div>
        </div>
      ) : null}

      <section className="cp-card">
        {results === null ? (
          <div className="cp-device-empty">
            Enter an Employee ID and Search to compare diagnostic captures.
          </div>
        ) : (
          <DataTable
            items={results}
            columns={columns}
            getRowId={(item) => item.id}
            pageSize={8}
            defaultSort={{ id: 'when', direction: 'desc' }}
            empty={
              searched && !enabled
                ? 'No captures while diagnostics are off.'
                : 'No diagnostic captures match this employee and time range.'
            }
          />
        )}
      </section>
    </>
  )
}

function TestTab({ tools }: { tools: AiAssistantTool[] }) {
  const [employeeId, setEmployeeId] = useState('')
  const [ran, setRan] = useState(false)
  const [results, setResults] = useState<
    Array<{ id: string; name: string; confidence: AiTestConfidence; detail: string }>
  >([])

  const columns: Array<
    DataTableColumn<{ id: string; name: string; confidence: AiTestConfidence; detail: string }>
  > = [
    {
      id: 'name',
      label: 'AI Tool',
      sortValue: (item) => item.name,
      render: (item) => <strong style={{ color: 'var(--cp-heading)' }}>{item.name}</strong>,
    },
    {
      id: 'confidence',
      label: 'Confidence',
      sortValue: (item) => item.confidence,
      render: (item) => (
        <span className={`cp-status ${confidenceTone(item.confidence)}`}>
          <span className="cp-status__dot" />
          {item.confidence}
        </span>
      ),
    },
    {
      id: 'detail',
      label: 'Notes',
      sortValue: (item) => item.detail,
      render: (item) => item.detail,
    },
  ]

  function runTest() {
    const id = employeeId.trim().toLowerCase()
    const employee = employees.find((item) => item.id.toLowerCase() === id)
    const captures = aiDiagnosticCaptures.filter((item) => item.employeeId.toLowerCase() === id)
    const enabledTools = tools.filter((item) => item.enabled)

    setRan(true)
    setResults(
      enabledTools.map((tool) => {
        const matched = captures.some((capture) => capture.matchedTool === tool.name)
        const recentFlag =
          Boolean(employee?.currentApp) &&
          tool.processNames.some((name) =>
            (employee?.currentApp ?? '').toLowerCase().includes(name.toLowerCase().slice(0, 6)),
          )
        let confidence: AiTestConfidence = 'None'
        let detail = 'Nothing has been seen for this employee against this rule.'
        if (matched) {
          confidence = 'High'
          detail = 'A fresh Diagnostics capture matched this rule.'
        } else if (recentFlag || (employee && employee.aiUsage && employee.aiUsage > 15 && tool.name === 'GitHub Copilot')) {
          confidence = 'Medium'
          detail = 'Activity already flagged this recently, without a fresh capture.'
        }
        if (!employee && id) {
          detail = 'Unknown Employee ID — no last check-in to score against.'
          confidence = 'None'
        }
        return { id: tool.id, name: tool.name, confidence, detail }
      }),
    )
  }

  const knownIds = useMemo(() => employees.map((item) => item.id).slice(0, 3).join(', '), [])

  return (
    <>
      <div className="cp-detect-copy">
        <p className="cp-card-sub">
          Best-effort, as-of-last-check-in verdict per configured rule — NOT a live/synchronous check
          (the agent is a polling client, not a server).
        </p>
        <p className="cp-card-sub">
          High confidence means a fresh Diagnostics capture matched; Medium means an activity log
          already flagged it recently without a fresh capture; None means nothing has been seen.
        </p>
      </div>
      <div className="cp-detect-bar">
        <div className="cp-detect-bar__id">
          <EuiFieldText
            compressed
            fullWidth
            value={employeeId}
            placeholder="Employee ID (e.g. CIPL0799)"
            onChange={(event) => setEmployeeId(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') runTest()
            }}
            aria-label="Employee ID"
          />
        </div>
        <EuiButton fill onClick={runTest} isDisabled={!employeeId.trim()}>
          Run Test
        </EuiButton>
      </div>
      <p className="cp-dept-form__note">Try a known ID such as {knownIds}.</p>

      <section className="cp-card">
        {!ran ? (
          <div className="cp-device-empty">Enter an Employee ID and Run Test to score each rule.</div>
        ) : (
          <DataTable
            items={results}
            columns={columns}
            getRowId={(item) => item.id}
            pageSize={8}
            defaultSort={{ id: 'confidence', direction: 'asc' }}
            empty="No enabled rules to test."
          />
        )}
      </section>
    </>
  )
}

function ToolDrawer({
  tool,
  isCreate,
  closing,
  onClose,
  onSave,
}: {
  tool: AiAssistantTool
  isCreate: boolean
  closing: boolean
  onClose: () => void
  onSave: (tool: AiAssistantTool) => void
}) {
  const [draft, setDraft] = useState(tool)
  const [processText, setProcessText] = useState(joinNames(tool.processNames))
  const [exeText, setExeText] = useState(joinNames(tool.executableNames))
  const canSave = draft.name.trim().length > 0 && splitNames(processText).length > 0

  function patch(next: Partial<AiAssistantTool>) {
    setDraft((current) => ({ ...current, ...next }))
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={`cp-overlay${closing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="presentation"
    >
      <aside
        className={`cp-drawer${closing ? ' is-closing' : ''}`}
        role="dialog"
        aria-labelledby="ai-tool-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cp-drawer__head">
          <div className="cp-drawer__head-copy">
            <div className="cp-drawer__title" id="ai-tool-title">
              {isCreate ? 'Add AI Tool' : 'Edit AI Tool'}
            </div>
          </div>
          <button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="cp-drawer__body">
          <EuiForm className="cp-form-stack" css={{ margin: 0 }} component="form">
            <FormField label={requiredLabel('AI Tool')}>
              <EuiFieldText
                compressed
                fullWidth
                value={draft.name}
                placeholder="e.g. GitHub Copilot"
                onChange={(event) => patch({ name: event.target.value })}
              />
            </FormField>
            <FormField label={requiredLabel('Process Names (comma-separated, exact match)')}>
              <EuiFieldText
                compressed
                fullWidth
                value={processText}
                placeholder="e.g. copilot-agent,copilot-language-server"
                onChange={(event) => setProcessText(event.target.value)}
              />
            </FormField>
            <FormField label="Executable Names (comma-separated, optional)">
              <EuiFieldText
                compressed
                fullWidth
                value={exeText}
                placeholder="e.g. copilot-agent.exe"
                onChange={(event) => setExeText(event.target.value)}
              />
            </FormField>
            <FormField>
              <EuiCheckbox
                id="ai-tool-enabled"
                label="Enabled"
                checked={draft.enabled}
                onChange={(event) => patch({ enabled: event.target.checked })}
              />
            </FormField>
            <FormField label="Notes (e.g. validation status)">
              <EuiTextArea
                compressed
                fullWidth
                rows={4}
                value={draft.notes}
                placeholder="e.g. Confirmed on Godwin's laptop 2026-08-25"
                onChange={(event) => patch({ notes: event.target.value })}
              />
            </FormField>
          </EuiForm>
        </div>
        <div className="cp-drawer__foot cp-drawer__foot--end">
          <EuiButton onClick={onClose}>Cancel</EuiButton>
          <EuiButton
            fill
            color="success"
            isDisabled={!canSave}
            onClick={() =>
              onSave({
                ...draft,
                name: draft.name.trim(),
                processNames: splitNames(processText),
                executableNames: splitNames(exeText),
              })
            }
          >
            {isCreate ? 'Create' : 'Save Changes'}
          </EuiButton>
        </div>
      </aside>
    </div>
  )
}
