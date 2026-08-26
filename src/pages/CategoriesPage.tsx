import { useEffect, useMemo, useRef, useState } from 'react'
import {
  EuiButton,
  EuiCheckbox,
  EuiFieldSearch,
  EuiFieldText,
  EuiForm,
  EuiIcon,
  EuiSelect,
} from '@elastic/eui'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { FilterPopover } from '../components/FilterPopover'
import { FormField } from '../components/FormField'
import { categoryRules as seedRules } from '../data/categories'
import { departmentRecords } from '../data/departments'
import type {
  CategoryClassification,
  CategoryKind,
  CategoryRule,
  CategoryRuleStatus,
} from '../types'

type TabId = CategoryKind

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'application', label: 'Applications' },
  { id: 'website', label: 'Websites' },
  { id: 'youtube', label: 'YouTube Categories' },
]
const CLASSIFICATIONS: CategoryClassification[] = ['Productive', 'Unproductive', 'Neutral']
const STATUSES: CategoryRuleStatus[] = ['Active', 'Inactive']
const AI_FILTERS = ['Yes', 'No']
const DEPARTMENTS = departmentRecords.map((item) => item.name)
const ALL_DEPARTMENTS = 'All Departments'
const ALL_FUNCTIONS = 'All Functions'

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  )
}

function requiredLabel(label: string) {
  return (
    <>
      {label} <span className="cp-req">*</span>
    </>
  )
}

function emptyRule(kind: CategoryKind): CategoryRule {
  return {
    id: `rule-${kind}-${Date.now()}`,
    kind,
    name: '',
    classification: '' as CategoryClassification,
    aiTool: false,
    department: ALL_DEPARTMENTS,
    functionName: ALL_FUNCTIONS,
    status: 'Active',
    priority: 10,
  }
}

function nameLabel(kind: CategoryKind) {
  if (kind === 'website') return 'Website'
  if (kind === 'youtube') return 'YouTube Category'
  return 'Process Name'
}

function namePlaceholder(kind: CategoryKind) {
  if (kind === 'website') return 'e.g. github.com'
  if (kind === 'youtube') return 'e.g. Education'
  return 'e.g. devenv.exe'
}

function searchPlaceholder(kind: CategoryKind) {
  if (kind === 'website') return 'Search website...'
  if (kind === 'youtube') return 'Search YouTube category...'
  return 'Search process name...'
}

function functionsForDepartment(department: string) {
  if (!department || department === ALL_DEPARTMENTS) return []
  return departmentRecords.find((item) => item.name === department)?.functions ?? []
}

function classificationTone(value: CategoryClassification) {
  if (value === 'Productive') return 'cp-status--active'
  if (value === 'Unproductive') return 'cp-status--offline'
  return 'cp-status--idle'
}

export function CategoriesPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<TabId>('application')
  const [rules, setRules] = useState(seedRules)
  const [query, setQuery] = useState('')
  const [classification, setClassification] = useState('')
  const [department, setDepartment] = useState('')
  const [fn, setFn] = useState('')
  const [status, setStatus] = useState('')
  const [aiTool, setAiTool] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [draft, setDraft] = useState<CategoryRule | null>(null)
  const [isCreate, setIsCreate] = useState(true)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const tabRules = useMemo(() => rules.filter((item) => item.kind === tab), [rules, tab])
  const departments = unique(tabRules.map((item) => item.department))
  const functions = unique(tabRules.map((item) => item.functionName))

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return tabRules.filter((item) => {
      if (classification && item.classification !== classification) return false
      if (department && item.department !== department) return false
      if (fn && item.functionName !== fn) return false
      if (status && item.status !== status) return false
      if (aiTool === 'Yes' && !item.aiTool) return false
      if (aiTool === 'No' && item.aiTool) return false
      if (!normalized) return true
      return item.name.toLowerCase().includes(normalized)
    })
  }, [aiTool, classification, department, fn, query, status, tabRules])

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 4000)
  }

  function resetFilters() {
    setQuery('')
    setClassification('')
    setDepartment('')
    setFn('')
    setStatus('')
    setAiTool('')
  }

  function openCreate() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setIsCreate(true)
    setClosing(false)
    setDraft(emptyRule(tab))
  }

  function openEdit(item: CategoryRule) {
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

  function saveDraft(next: CategoryRule) {
    setRules((current) => {
      const exists = current.some((item) => item.id === next.id)
      return exists
        ? current.map((item) => (item.id === next.id ? next : item))
        : [next, ...current]
    })
    showNotice(isCreate ? `Rule created for ${next.name}.` : `Rule updated for ${next.name}.`)
    closeDrawer()
  }

  function removeRule(item: CategoryRule) {
    const confirmed = window.confirm(`Delete the rule for ${item.name}?`)
    if (!confirmed) return
    setRules((current) => current.filter((rule) => rule.id !== item.id))
    showNotice(`Deleted ${item.name}.`)
  }

  const columns: Array<DataTableColumn<CategoryRule>> = [
    {
      id: 'name',
      label: tab === 'website' ? 'Website' : tab === 'youtube' ? 'Category' : 'Process Name',
      sortValue: (item) => item.name,
      render: (item) => (
        <strong className="cp-mono" style={{ color: 'var(--cp-heading)' }}>
          {item.name}
        </strong>
      ),
    },
    {
      id: 'classification',
      label: 'Classification',
      sortValue: (item) => item.classification,
      render: (item) => (
        <span className={`cp-status ${classificationTone(item.classification)}`}>
          <span className="cp-status__dot" />
          {item.classification}
        </span>
      ),
    },
    {
      id: 'ai',
      label: 'AI',
      align: 'center',
      sortValue: (item) => (item.aiTool ? 1 : 0),
      render: (item) => (item.aiTool ? <span className="cp-ai-pill">AI</span> : '—'),
    },
    {
      id: 'department',
      label: 'Department',
      sortValue: (item) => item.department,
      render: (item) =>
        item.department && item.department !== ALL_DEPARTMENTS ? (
          <span className="cp-func-tag">{item.department}</span>
        ) : (
          ALL_DEPARTMENTS
        ),
    },
    {
      id: 'function',
      label: 'Function',
      sortValue: (item) => item.functionName,
      render: (item) => item.functionName || ALL_FUNCTIONS,
    },
    {
      id: 'status',
      label: 'Status',
      sortValue: (item) => item.status,
      render: (item) => (
        <span
          className={`cp-dept-status${item.status === 'Inactive' ? ' cp-dept-status--inactive' : ''}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      align: 'center',
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
              removeRule(item)
            }}
          >
            <EuiIcon type="trash" size="s" />
          </button>
        </span>
      ),
    },
  ]

  return (
    <section>
      <div className="cp-incident-head">
        <h1 className="cp-activity-title">App & Website Categories</h1>
        <div className="cp-incident-head__action cp-head-actions">
          <EuiButton size="s" onClick={() => fileRef.current?.click()}>
            Import CSV
          </EuiButton>
          <EuiButton size="s" fill color="success" iconType="plus" onClick={openCreate}>
            Add Rule
          </EuiButton>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              showNotice(`Imported category rules from ${file.name}.`)
            }}
          />
        </div>
      </div>

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
              resetFilters()
              if (draft) closeDrawer()
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="cp-card cp-master-table">
        <EuiForm css={{ margin: 0 }}>
          <div className="cp-activity-filters cp-activity-filters--cats">
            <EuiFieldSearch
              compressed
              fullWidth
              incremental
              isClearable
              placeholder={searchPlaceholder(tab)}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={searchPlaceholder(tab)}
            />
            <FilterPopover
              hideLabel
              label="Classification"
              placeholder="All Classifications"
              options={CLASSIFICATIONS}
              value={classification}
              onChange={setClassification}
            />
            <FilterPopover
              hideLabel
              label="Department"
              placeholder="All Departments"
              options={departments}
              value={department}
              onChange={setDepartment}
            />
            <FilterPopover
              hideLabel
              label="Function"
              placeholder="All Functions"
              options={functions}
              value={fn}
              onChange={setFn}
            />
            <FilterPopover
              hideLabel
              label="Status"
              placeholder="All Statuses"
              options={STATUSES}
              value={status}
              onChange={setStatus}
            />
            <FilterPopover
              hideLabel
              label="AI Tool"
              placeholder="All (AI Tool)"
              options={AI_FILTERS}
              value={aiTool}
              onChange={setAiTool}
            />
          </div>
        </EuiForm>
        <DataTable
          items={filtered}
          columns={columns}
          getRowId={(item) => item.id}
          pageSize={8}
          defaultSort={null}
          empty="No category rules match. Try clearing search or widening the filters."
        />
      </section>

      {draft ? (
        <RuleDrawer
          key={draft.id}
          rule={draft}
          isCreate={isCreate}
          closing={closing}
          onClose={closeDrawer}
          onSave={saveDraft}
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

function RuleDrawer({
  rule,
  isCreate,
  closing,
  onClose,
  onSave,
}: {
  rule: CategoryRule
  isCreate: boolean
  closing: boolean
  onClose: () => void
  onSave: (rule: CategoryRule) => void
}) {
  const [draft, setDraft] = useState(rule)
  const functionOptions = functionsForDepartment(draft.department)
  const scoped = draft.department !== ALL_DEPARTMENTS
  const kindLabel =
    draft.kind === 'website' ? 'Website' : draft.kind === 'youtube' ? 'YouTube Category' : 'Application'
  const canSave = draft.name.trim().length > 0 && CLASSIFICATIONS.includes(draft.classification)

  function patch(next: Partial<CategoryRule>) {
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
        aria-labelledby="category-rule-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cp-drawer__head">
          <div className="cp-drawer__head-copy">
            <div className="cp-drawer__title" id="category-rule-title">
              {isCreate ? `Add Rule — ${kindLabel}` : `Edit Rule — ${kindLabel}`}
            </div>
          </div>
          <button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="cp-drawer__body">
          <EuiForm className="cp-form-stack" css={{ margin: 0 }} component="form">
            <FormField label={requiredLabel(nameLabel(draft.kind))}>
              <EuiFieldText
                compressed
                fullWidth
                value={draft.name}
                placeholder={namePlaceholder(draft.kind)}
                onChange={(event) => patch({ name: event.target.value })}
              />
            </FormField>
            <FormField label={requiredLabel('Category')}>
              <EuiSelect
                compressed
                fullWidth
                options={[
                  { value: '', text: 'Select a category' },
                  ...CLASSIFICATIONS.map((value) => ({ value, text: value })),
                ]}
                value={draft.classification}
                onChange={(event) =>
                  patch({ classification: event.target.value as CategoryClassification })
                }
              />
            </FormField>
            <FormField label="Department">
              <EuiSelect
                compressed
                fullWidth
                options={[
                  { value: ALL_DEPARTMENTS, text: 'All Departments (global default)' },
                  ...DEPARTMENTS.map((value) => ({ value, text: value })),
                ]}
                value={draft.department}
                onChange={(event) =>
                  patch({ department: event.target.value, functionName: ALL_FUNCTIONS })
                }
              />
            </FormField>
            <FormField
              label="Function"
              helpText="Select a Department first to scope this rule to one of its Functions."
            >
              <EuiSelect
                compressed
                fullWidth
                disabled={!scoped}
                options={[
                  { value: ALL_FUNCTIONS, text: 'All Functions (whole department)' },
                  ...functionOptions.map((value) => ({ value, text: value })),
                ]}
                value={draft.functionName}
                onChange={(event) => patch({ functionName: event.target.value })}
              />
            </FormField>
            <FormField
              label="Priority"
              helpText="Tiebreaker only between rules at the same specificity (same Department/Function match) — lower runs first."
            >
              <EuiFieldText
                compressed
                fullWidth
                value={String(draft.priority)}
                onChange={(event) => {
                  const next = Number(event.target.value)
                  patch({ priority: Number.isFinite(next) ? next : 0 })
                }}
              />
            </FormField>
            <FormField helpText="Marks this as a known AI tool for the AI Usage Score — independent of Classification above (it can be Productive AND an AI Tool at once).">
              <EuiCheckbox
                id="category-ai-tool"
                label="AI Tool"
                checked={draft.aiTool}
                onChange={(event) => patch({ aiTool: event.target.checked })}
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
            onClick={() => onSave({ ...draft, name: draft.name.trim() })}
          >
            {isCreate ? 'Create' : 'Save Changes'}
          </EuiButton>
        </div>
      </aside>
    </div>
  )
}
