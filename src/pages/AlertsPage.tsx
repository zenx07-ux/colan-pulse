import { useEffect, useMemo, useState } from 'react'
import {
  EuiButton,
  EuiButtonGroup,
  EuiCheckbox,
  EuiDatePicker,
  EuiEmptyPrompt,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiIcon,
} from '@elastic/eui'
import type { Moment } from 'moment'
import { FilterPopover } from '../components/FilterPopover'
import { FormField } from '../components/FormField'
import { incidents as seedIncidents } from '../data/incidents'
import { formatRelative } from '../utils/format'
import type { Incident, IncidentSeverity } from '../types'

type ReadFilter = 'all' | 'unread' | 'read'

const PAGE_SIZE = 10

function unique(values: string[]) {
  return Array.from(new Set(values)).sort()
}

export function AlertsPage() {
  const [query, setQuery] = useState('')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [dateFrom, setDateFrom] = useState<Moment | null>(null)
  const [dateTo, setDateTo] = useState<Moment | null>(null)
  const [detectionType, setDetectionType] = useState('')
  const [device, setDevice] = useState('')
  const [manager, setManager] = useState('')
  const [techLead, setTechLead] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [nonce, setNonce] = useState(0)

  const incidents = useMemo(() => seedIncidents, [nonce])

  const detectionTypes = unique(incidents.map((item) => item.detectionType))
  const devices = unique(incidents.map((item) => item.device))
  const managers = unique(incidents.map((item) => item.manager))
  const techLeads = unique(incidents.map((item) => item.techLead))

  const unreadCount = incidents.filter((item) => !item.read).length
  const highCount = incidents.filter(
    (item) => item.severity === 'high' || item.severity === 'critical',
  ).length
  const mediumCount = incidents.filter((item) => item.severity === 'medium').length
  const lowCount = incidents.filter((item) => item.severity === 'low').length

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return incidents.filter((item) => {
      if (readFilter === 'read' && !item.read) return false
      if (readFilter === 'unread' && item.read) return false
      if (detectionType && item.detectionType !== detectionType) return false
      if (device && item.device !== device) return false
      if (manager && item.manager !== manager) return false
      if (techLead && item.techLead !== techLead) return false
      if (dateFrom && new Date(item.occurredAt) < dateFrom.clone().startOf('day').toDate()) {
        return false
      }
      if (dateTo && new Date(item.occurredAt) > dateTo.clone().endOf('day').toDate()) {
        return false
      }
      if (!normalized) return true
      return [item.title, item.employee, item.detectionType, item.device, item.manager, item.techLead]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    })
  }, [
    dateFrom,
    dateTo,
    detectionType,
    device,
    incidents,
    manager,
    query,
    readFilter,
    techLead,
  ])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const start = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1
  const end = Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  useEffect(() => {
    setPage(0)
  }, [query, readFilter, dateFrom, dateTo, detectionType, device, manager, techLead])

  const allSelected =
    pageItems.length > 0 && pageItems.every((item) => selected.has(item.id))
  const someSelected = pageItems.some((item) => selected.has(item.id))

  function toggleOne(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) {
      setSelected((current) => {
        const next = new Set(current)
        pageItems.forEach((item) => next.delete(item.id))
        return next
      })
      return
    }
    setSelected((current) => {
      const next = new Set(current)
      pageItems.forEach((item) => next.add(item.id))
      return next
    })
  }

  const pageNumbers = visiblePages(safePage, pages)

  return (
    <section className="cp-incident-page">
      <div className="cp-incident-head">
        <h1 className="cp-activity-title">🚨 Incident Center</h1>
        <div className="cp-incident-head__action">
          <EuiButton
            size="s"
            iconType="refresh"
            onClick={() => {
              setSelected(new Set())
              setPage(0)
              setNonce((value) => value + 1)
            }}
          >
            Refresh
          </EuiButton>
        </div>
      </div>

      <div className="cp-incident-kpis">
        <Kpi value={unreadCount} label="Unread" tone="var(--cp-primary-text)" />
        <Kpi value={highCount} label="High / Critical" tone="var(--cp-danger-text)" />
        <Kpi value={mediumCount} label="Medium" tone="var(--cp-warning-text)" />
        <Kpi value={lowCount} label="Low" tone="var(--cp-success-text)" />
      </div>

      <EuiForm css={{ margin: 0 }}>
        <div className="cp-incident-toolbar">
          <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false} wrap>
            <EuiFlexItem>
              <EuiFieldSearch
                compressed
                fullWidth
                incremental
                isClearable
                placeholder="Search by employee, title, or detection type..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search incidents"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonGroup
                legend="Read status"
                buttonSize="compressed"
                color="primary"
                type="single"
                idSelected={readFilter}
                onChange={(id) => setReadFilter(id as ReadFilter)}
                options={[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'read', label: 'Read' },
                ]}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>

        <div className="cp-incident-filters">
          <FormField className="cp-filter" label="Date from">
            <EuiDatePicker
              compressed
              fullWidth
              selected={dateFrom}
              onChange={(value) => setDateFrom(value)}
              onClear={() => setDateFrom(null)}
              placeholder="Date"
              dateFormat="DD-MM-YYYY"
            />
          </FormField>
          <FormField className="cp-filter" label="Date to">
            <EuiDatePicker
              compressed
              fullWidth
              selected={dateTo}
              onChange={(value) => setDateTo(value)}
              onClear={() => setDateTo(null)}
              placeholder="Date"
              minDate={dateFrom ?? undefined}
              dateFormat="DD-MM-YYYY"
            />
          </FormField>
          <FilterPopover
            label="Detection type"
            placeholder="All Types"
            options={detectionTypes}
            value={detectionType}
            onChange={setDetectionType}
          />
          <FilterPopover
            label="Device"
            placeholder="All Devices"
            options={devices}
            value={device}
            onChange={setDevice}
          />
          <FilterPopover
            label="Manager"
            placeholder="All Managers"
            options={managers}
            value={manager}
            onChange={setManager}
          />
          <FilterPopover
            label="Tech lead"
            placeholder="All Tech Leads"
            options={techLeads}
            value={techLead}
            onChange={setTechLead}
          />
        </div>
      </EuiForm>

      <div className="cp-incident-selectall">
        <EuiCheckbox
          id="incident-select-all"
          label="Select All"
          checked={allSelected}
          indeterminate={!allSelected && someSelected}
          disabled={pageItems.length === 0}
          onChange={toggleAll}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="cp-card">
          <EuiEmptyPrompt
            iconType="bell"
            title={<h3>No incidents match</h3>}
            body={<p>Try clearing search or widening the date and filter range.</p>}
          />
        </div>
      ) : (
        <>
          <div className="cp-incident-list">
            {pageItems.map((item) => (
              <IncidentCard
                key={item.id}
                incident={item}
                checked={selected.has(item.id)}
                onToggle={() => toggleOne(item.id)}
              />
            ))}
          </div>

          <div className="cp-pager cp-incident-pager">
            <span className="cp-pager__label">
              Showing {start} - {end} of {filtered.length}
            </span>
            <div className="cp-pager__actions">
              <button
                type="button"
                className="cp-page-btn"
                disabled={safePage <= 0}
                aria-label="Previous page"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                ‹
              </button>
              {pageNumbers.map((item, index) =>
                item === '…' ? (
                  <span key={`ellipsis-${index}`} className="cp-page-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={`cp-page-btn${safePage === item ? ' is-active' : ''}`}
                    aria-label={`Page ${item + 1}`}
                    aria-current={safePage === item ? 'page' : undefined}
                    onClick={() => setPage(item)}
                  >
                    {item + 1}
                  </button>
                ),
              )}
              <button
                type="button"
                className="cp-page-btn"
                disabled={safePage >= pages - 1}
                aria-label="Next page"
                onClick={() => setPage((current) => Math.min(pages - 1, current + 1))}
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

function visiblePages(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index)
  const pages: Array<number | '…'> = [0]
  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)
  if (start > 1) pages.push('…')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < total - 2) pages.push('…')
  pages.push(total - 1)
  return pages
}

function Kpi({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone: string
}) {
  return (
    <div className="cp-card cp-incident-kpi">
      <div className="cp-incident-kpi__value" style={{ color: tone }}>
        {value}
      </div>
      <div className="cp-incident-kpi__label">{label}</div>
    </div>
  )
}

function IncidentCard({
  incident,
  checked,
  onToggle,
}: {
  incident: Incident
  checked: boolean
  onToggle: () => void
}) {
  return (
    <article className={`cp-incident cp-incident--${incident.severity}`}>
      <EuiCheckbox
        id={`incident-${incident.id}`}
        checked={checked}
        onChange={onToggle}
        aria-label={`Select ${incident.employee}`}
      />
      <div className="cp-incident-flags">
        <SeverityBadge severity={incident.severity} />
        <span className={`cp-read-pill${incident.read ? '' : ' is-unread'}`}>
          {incident.read ? 'READ' : 'UNREAD'}
        </span>
      </div>
      <div className="cp-incident-body">
        <p className="cp-incident-title">{incident.title}</p>
        <div className="cp-incident-meta">
          <span className="cp-type-pill">{incident.detectionType}</span>
          <span className="cp-incident-meta__item">
            <EuiIcon type="user" size="s" />
            {incident.employee}
          </span>
          <span className="cp-incident-meta__item">
            <EuiIcon type="users" size="s" />
            {incident.manager}
          </span>
          <span className="cp-incident-meta__item">
            <EuiIcon type="users" size="s" />
            {incident.techLead}
          </span>
          <span className="cp-incident-meta__item">
            <EuiIcon type="desktop" size="s" />
            {incident.device}
          </span>
          <span className="cp-incident-meta__item">
            <EuiIcon type="warning" size="s" color="warning" />
            {incident.warningCount}
          </span>
          <span className="cp-incident-meta__item cp-incident-meta__pct">
            <EuiIcon type="bullseye" size="s" color="danger" />
            {incident.usagePct}%
          </span>
          <span className="cp-incident-meta__time">
            <EuiIcon type="clock" size="s" />
            {formatRelative(incident.occurredAt)}
          </span>
        </div>
      </div>
    </article>
  )
}

function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return <span className={`cp-sev cp-sev--${severity}`}>{severity.toUpperCase()}</span>
}
