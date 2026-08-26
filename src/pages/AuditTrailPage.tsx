import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EuiButton, EuiFieldSearch, EuiForm, EuiIcon } from '@elastic/eui'
import { FormField } from '../components/FormField'
import { PageHeading } from '../components/PageHeading'
import { auditTrail as seedAudit } from '../data/auditTrail'
import type { AuditAction, AuditEntry } from '../types'

type TabId = 'all' | AuditAction

const TAB_ORDER: AuditAction[] = [
  'CategoryRuleCreated',
  'Login',
  'Logout',
  'PasswordChanged',
  'PasswordReset',
  'RoleChanged',
  'SettingsUpdated',
  'ScreenshotViewed',
]
const PAGE_SIZE = 8

const TABLE_ROUTES: Record<string, string> = {
  UserAccounts: '/user-management',
  CategoryRules: '/categories',
  Settings: '/settings',
}

function formatStamp(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function actionLabel(action: AuditAction) {
  return action.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()
}

export function AuditTrailPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>('all')
  const [query, setQuery] = useState('')
  const [applied, setApplied] = useState('')
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState<string | null>(seedAudit[0]?.id ?? null)
  const [nonce, setNonce] = useState(0)

  const entries = useMemo(() => seedAudit, [nonce])

  const tabs = useMemo(() => {
    const present = new Set(entries.map((item) => item.action))
    return [
      { id: 'all' as const, label: 'All' },
      ...TAB_ORDER.filter((action) => present.has(action)).map((action) => ({
        id: action,
        label: action,
      })),
    ]
  }, [entries])

  const filtered = useMemo(() => {
    const q = applied.trim().toLowerCase()
    return entries.filter((item) => {
      if (tab !== 'all' && item.action !== tab) return false
      if (!q) return true
      const haystack = [
        item.userId,
        item.action,
        item.table,
        item.ip,
        JSON.stringify(item.after ?? {}),
        item.device,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [applied, entries, tab])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const start = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1
  const end = Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function applySearch() {
    setPage(0)
    setApplied(query)
  }

  function clearSearch() {
    setQuery('')
    setApplied('')
    setPage(0)
  }

  function openTable(table: string) {
    const path = TABLE_ROUTES[table]
    if (path) navigate(path)
  }

  return (
    <section className="cp-page cp-audit-page">
      <PageHeading
        title="Audit Trail"
        description="Who did what, when — logins, role changes, policy/settings changes, and screenshot views. Read-only, retained for compliance review."
      />

      <section className="cp-card cp-audit-toolbar">
        <EuiForm css={{ margin: 0 }}>
          <div className="cp-audit-search">
            <FormField label="Search" className="cp-filter">
              <EuiFieldSearch
                compressed
                fullWidth
                incremental
                isClearable
                placeholder="Search user, action, table, IP..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onSearch={applySearch}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applySearch()
                }}
              />
            </FormField>
            <div className="cp-filter-actions">
              <EuiButton size="s" onClick={clearSearch}>
                Clear
              </EuiButton>
              <EuiButton
                size="s"
                fill
                iconType="refresh"
                onClick={() => {
                  setNonce((value) => value + 1)
                  setOpenId(seedAudit[0]?.id ?? null)
                  setPage(0)
                }}
              >
                Refresh
              </EuiButton>
            </div>
          </div>
        </EuiForm>
      </section>

      <div className="cp-tabs" role="tablist" aria-label="Audit actions">
        {tabs.map((item) => (
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

      {pageItems.length === 0 ? (
        <section className="cp-card">
          <div className="cp-device-empty">
            No audit events match. Try clearing search or choosing All.
          </div>
        </section>
      ) : (
        <div className="cp-audit-list">
          {pageItems.map((item) => (
            <AuditRow
              key={item.id}
              item={item}
              open={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              onOpenTable={openTable}
            />
          ))}
        </div>
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
  )
}

function AuditRow({
  item,
  open,
  onToggle,
  onOpenTable,
}: {
  item: AuditEntry
  open: boolean
  onToggle: () => void
  onOpenTable: (table: string) => void
}) {
  const linked = Boolean(TABLE_ROUTES[item.table])

  return (
    <article className={`cp-card cp-audit-row${open ? ' is-open' : ''}`}>
      <div
        className="cp-audit-row__top"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggle()
          }
        }}
      >
        <span className={`cp-audit-badge cp-audit-badge--${item.action.toLowerCase()}`}>
          {actionLabel(item.action)}
        </span>
        <span className="cp-audit-who">
          <span className="cp-audit-who__line">
            <strong>{item.userId}</strong>
            {linked ? (
              <button
                type="button"
                className="cp-audit-table"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenTable(item.table)
                }}
              >
                {item.table}
              </button>
            ) : (
              <span className="cp-audit-table cp-audit-table--plain">{item.table}</span>
            )}
          </span>
          <span className="cp-mono cp-audit-ip">{item.ip}</span>
        </span>
        <span className="cp-audit-when">{formatStamp(item.timestamp)}</span>
        <span className="cp-audit-toggle" aria-hidden="true">
          <EuiIcon type={open ? 'arrowDown' : 'arrowRight'} size="s" />
        </span>
      </div>

      {open ? (
        <div className="cp-audit-detail">
          {item.after ? (
            <div className="cp-audit-block">
              <div className="cp-audit-block__label">After</div>
              <pre className="cp-audit-code">{JSON.stringify(item.after, null, 2)}</pre>
            </div>
          ) : null}
          <div className="cp-audit-block">
            <div className="cp-audit-block__label">Device</div>
            <pre className="cp-audit-code">{item.device}</pre>
          </div>
        </div>
      ) : null}
    </article>
  )
}
