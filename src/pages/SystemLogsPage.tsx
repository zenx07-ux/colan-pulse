import { useMemo, useState } from 'react'
import {
  EuiButton,
  EuiDatePicker,
  EuiFieldSearch,
  EuiFieldText,
  EuiForm,
  EuiIcon,
} from '@elastic/eui'
import type { Moment } from 'moment'
import moment from 'moment'
import { FormField } from '../components/FormField'
import { PageHeading } from '../components/PageHeading'
import { systemLogs as seedLogs } from '../data/systemLogs'
import type { SystemLogKind } from '../types'

type TabId = 'all' | SystemLogKind

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'api', label: 'Backend (API)' },
  { id: 'agent', label: 'Desktop Agent' },
]
const PAGE_SIZE = 8

export function SystemLogsPage() {
  const [tab, setTab] = useState<TabId>('all')
  const [employeeId, setEmployeeId] = useState('')
  const [query, setQuery] = useState('')
  const [fromDate, setFromDate] = useState<Moment | null>(null)
  const [toDate, setToDate] = useState<Moment | null>(null)
  const [applied, setApplied] = useState({
    employeeId: '',
    query: '',
    from: null as Moment | null,
    to: null as Moment | null,
  })
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const id = applied.employeeId.trim().toLowerCase()
    const q = applied.query.trim().toLowerCase()
    return seedLogs.filter((item) => {
      if (tab !== 'all' && item.kind !== tab) return false
      if (id && (item.employeeId ?? '').toLowerCase() !== id) return false
      if (applied.from && moment.utc(item.timestamp).isBefore(applied.from, 'day')) return false
      if (applied.to && moment.utc(item.timestamp).isAfter(applied.to, 'day')) return false
      if (q) {
        const haystack = [
          item.exception,
          item.category,
          item.message,
          item.detail,
          item.employeeName,
          item.employeeId,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [applied, tab])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const start = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1
  const end = Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function applyFilters() {
    setPage(0)
    setApplied({
      employeeId,
      query,
      from: fromDate,
      to: toDate,
    })
  }

  function clearFilters() {
    setEmployeeId('')
    setQuery('')
    setFromDate(null)
    setToDate(null)
    setPage(0)
    setApplied({ employeeId: '', query: '', from: null, to: null })
  }

  return (
    <section className="cp-page cp-logs-page">
      <PageHeading
        title="System Logs"
        description="Technical failures (DB errors, agent crashes) — filter by employee to see if an issue is affecting one person or the whole system."
      />

      <section className="cp-card cp-event-filters">
        <EuiForm css={{ margin: 0 }}>
          <div className="cp-log-filters">
            <FormField label="Employee ID" className="cp-filter">
              <EuiFieldText
                compressed
                fullWidth
                value={employeeId}
                placeholder="e.g. CIPL1701"
                onChange={(event) => setEmployeeId(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyFilters()
                }}
              />
            </FormField>
            <FormField label="From" className="cp-filter">
              <EuiDatePicker
                compressed
                fullWidth
                selected={fromDate}
                onChange={setFromDate}
                onClear={() => setFromDate(null)}
                placeholder="dd-mm-yyyy"
                dateFormat="DD-MM-YYYY"
              />
            </FormField>
            <FormField label="To" className="cp-filter">
              <EuiDatePicker
                compressed
                fullWidth
                selected={toDate}
                onChange={setToDate}
                onClear={() => setToDate(null)}
                placeholder="dd-mm-yyyy"
                dateFormat="DD-MM-YYYY"
                minDate={fromDate ?? undefined}
              />
            </FormField>
            <FormField label="Search" className="cp-filter">
              <EuiFieldSearch
                compressed
                fullWidth
                incremental
                isClearable
                placeholder="Search message, exception type, endpoint"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onSearch={applyFilters}
              />
            </FormField>
            <div className="cp-filter-actions">
              <EuiButton size="s" fill onClick={applyFilters}>
                Apply
              </EuiButton>
              <EuiButton size="s" onClick={clearFilters}>
                Clear
              </EuiButton>
            </div>
          </div>
        </EuiForm>
      </section>

      <div className="cp-tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`cp-tab${tab === item.id ? ' is-active' : ''}`}
            onClick={() => {
              setTab(item.id)
              setPage(0)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="cp-card">
        {pageItems.length === 0 ? (
          <div className="cp-device-empty">No logs match. Try clearing filters or widening the dates.</div>
        ) : (
          pageItems.map((item) => {
            const open = openId === item.id
            const who = item.employeeName
              ? `${item.employeeName} (${item.employeeId})`
              : 'Unidentified'
            return (
              <article key={item.id} className="cp-log-card">
                <button
                  type="button"
                  className="cp-log-card__top"
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-expanded={open}
                >
                  <span className={`cp-log-kind cp-log-kind--${item.kind}`}>
                    {item.kind === 'agent' ? 'AGENT' : 'API'}
                  </span>
                  <span className="cp-log-ex">{item.exception}</span>
                  <span className="cp-error-cat">{item.category}</span>
                  <span className="cp-log-who">{who}</span>
                  <EuiIcon type={open ? 'arrowDown' : 'arrowRight'} size="s" />
                </button>
                <p className="cp-error-detail">{item.message}</p>
                <div className="cp-log-card__meta">
                  <span className="cp-mono">{item.detail}</span>
                  <span className="cp-card-sub">
                    {moment.utc(item.timestamp).format('DD MMM YYYY, HH:mm')} UTC
                  </span>
                </div>
                {open ? (
                  <pre className="cp-log-stack">
                    {item.exception}: {item.message}
                    {'\n'}
                    {item.detail}
                    {'\n'}
                    at ColanPulse.{item.kind === 'agent' ? 'Agent' : 'Api'}.Pipeline.Invoke()
                  </pre>
                ) : null}
              </article>
            )
          })
        )}
        <div className="cp-pager">
          <span className="cp-pager__label">
            {filtered.length === 0
              ? 'Showing 0 of 0'
              : `Showing ${start} - ${end} of ${filtered.length}`}
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
            {Array.from({ length: pages }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`cp-page-btn${safePage === index ? ' is-active' : ''}`}
                aria-label={`Page ${index + 1}`}
                aria-current={safePage === index ? 'page' : undefined}
                onClick={() => setPage(index)}
              >
                {index + 1}
              </button>
            ))}
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
      </section>
    </section>
  )
}
