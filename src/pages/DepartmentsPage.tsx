import { useMemo, useState } from 'react'
import {
  EuiButton,
  EuiCheckbox,
  EuiFieldSearch,
  EuiFieldText,
  EuiForm,
  EuiIcon,
} from '@elastic/eui'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { FormField } from '../components/FormField'
import { PageHeading } from '../components/PageHeading'
import {
  DEPARTMENT_FUNCTIONS,
  departmentRecords as seedDepartments,
} from '../data/departments'
import type { DepartmentRecord } from '../types'

const VISIBLE_FUNCTIONS = 3

function emptyDepartment(): DepartmentRecord {
  return {
    id: `dept-${Date.now()}`,
    name: '',
    functions: [],
    status: 'active',
  }
}

export function DepartmentsPage() {
  const [departments, setDepartments] = useState(seedDepartments)
  const [editing, setEditing] = useState<DepartmentRecord | null>(null)
  const [isCreate, setIsCreate] = useState(false)
  const [catalog, setCatalog] = useState(DEPARTMENT_FUNCTIONS)

  const columns: Array<DataTableColumn<DepartmentRecord>> = useMemo(
    () => [
      {
        id: 'name',
        label: 'Department Name',
        sortValue: (item) => item.name,
        render: (item) => (
          <span style={{ color: 'var(--cp-heading)', fontWeight: 500 }}>{item.name}</span>
        ),
      },
      {
        id: 'functions',
        label: 'Functions',
        sortable: false,
        render: (item) => <FunctionTags functions={item.functions} />,
      },
      {
        id: 'status',
        label: 'Status',
        sortValue: (item) => item.status,
        render: (item) => (
          <span
            className={
              item.status === 'active' ? 'cp-dept-status' : 'cp-dept-status cp-dept-status--inactive'
            }
          >
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        id: 'actions',
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
                setIsCreate(false)
                setEditing(item)
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
                setDepartments((current) => current.filter((dept) => dept.id !== item.id))
              }}
            >
              <EuiIcon type="trash" size="s" />
            </button>
          </span>
        ),
      },
    ],
    [],
  )

  if (editing) {
    return (
      <DepartmentFormView
        key={editing.id}
        department={editing}
        isCreate={isCreate}
        catalog={catalog}
        onCatalogChange={setCatalog}
        onClose={() => setEditing(null)}
        onSave={(next) => {
          setDepartments((current) => {
            const exists = current.some((item) => item.id === next.id)
            return exists
              ? current.map((item) => (item.id === next.id ? next : item))
              : [next, ...current]
          })
          setEditing(null)
        }}
      />
    )
  }

  return (
    <section className="cp-page">
      <PageHeading
        title="Departments"
        description="Department and function catalog used across filters and reporting."
        extra={
          <EuiButton
            size="s"
            fill
            color="success"
            iconType="plus"
            onClick={() => {
              setIsCreate(true)
              setEditing(emptyDepartment())
            }}
          >
            Create Department
          </EuiButton>
        }
      />

      <section className="cp-card">
        <DataTable
          items={departments}
          columns={columns}
          getRowId={(item) => item.id}
          pageSize={10}
          defaultSort={null}
          empty="No departments yet"
        />
      </section>
    </section>
  )
}

function FunctionTags({ functions }: { functions: string[] }) {
  if (functions.length === 0) {
    return <span className="cp-card-sub">—</span>
  }

  const visible = functions.slice(0, VISIBLE_FUNCTIONS)
  const overflow = functions.length - visible.length

  return (
    <div className="cp-func-tags">
      {visible.map((fn) => (
        <span key={fn} className="cp-func-tag">
          {fn}
        </span>
      ))}
      {overflow > 0 ? <span className="cp-func-tag cp-func-tag--more">+{overflow} more</span> : null}
    </div>
  )
}

function DepartmentFormView({
  department,
  isCreate,
  catalog,
  onCatalogChange,
  onClose,
  onSave,
}: {
  department: DepartmentRecord
  isCreate: boolean
  catalog: string[]
  onCatalogChange: (next: string[]) => void
  onClose: () => void
  onSave: (department: DepartmentRecord) => void
}) {
  const [name, setName] = useState(department.name)
  const [selected, setSelected] = useState<string[]>(department.functions)
  const [query, setQuery] = useState('')
  const [newFunction, setNewFunction] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog
    return catalog.filter((item) => item.toLowerCase().includes(q))
  }, [catalog, query])

  function toggleFunction(label: string) {
    setSelected((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    )
  }

  function addFunction() {
    const normalized = newFunction.trim()
    if (!normalized) return
    const exists = catalog.some((item) => item.toLowerCase() === normalized.toLowerCase())
    if (!exists) {
      onCatalogChange(
        [...catalog, normalized].sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: 'base' }),
        ),
      )
    }
    setSelected((current) => (current.includes(normalized) ? current : [...current, normalized]))
    setNewFunction('')
  }

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({
      ...department,
      name: trimmed,
      functions: selected,
      status: 'active',
    })
  }

  return (
    <section className="cp-page cp-dept-form">
      <PageHeading
        title={isCreate ? 'Create Department' : 'Edit Department'}
        description="Department Master — who reports to whom lives on the Employee Master screen; this is just Department and its Functions."
        extra={
          <EuiButton size="s" onClick={onClose}>
            ← Back to Departments
          </EuiButton>
        }
      />

      <EuiForm className="cp-dept-form__grid" component="form" onSubmit={(event) => event.preventDefault()}>
        <section className="cp-card cp-form-card cp-dept-form__dept">
          <h2 className="cp-form-card__title">Department</h2>
          <FormField
            label={
              <>
                Department Name <span className="cp-req">*</span>
              </>
            }
          >
            <EuiFieldText
              compressed
              fullWidth
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Software Development"
            />
          </FormField>
          <div className="cp-dept-form__actions">
            <EuiButton size="s" onClick={onClose}>
              Cancel
            </EuiButton>
            <EuiButton
              size="s"
              fill
              color="success"
              onClick={submit}
              isDisabled={!name.trim()}
            >
              {isCreate ? 'Create Department' : 'Update Department'}
            </EuiButton>
          </div>
        </section>

        <section className="cp-card cp-form-card cp-dept-form__funcs">
          <h2 className="cp-form-card__title">Functions</h2>
          <EuiFieldSearch
            compressed
            fullWidth
            incremental
            isClearable
            placeholder="Search function..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search functions"
          />

          <div className="cp-func-check-wrap">
            <div className="cp-func-check-grid" role="group" aria-label="Department functions">
              {filtered.length === 0 ? (
                <div className="cp-func-check-empty">No functions match your search.</div>
              ) : (
                filtered.map((fn) => {
                  const id = `dept-fn-${fn.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
                  return (
                    <EuiCheckbox
                      key={fn}
                      id={id}
                      label={fn}
                      checked={selected.includes(fn)}
                      onChange={() => toggleFunction(fn)}
                    />
                  )
                })
              )}
            </div>
          </div>

          <div className="cp-func-add">
            <EuiFieldText
              compressed
              fullWidth
              value={newFunction}
              onChange={(event) => setNewFunction(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addFunction()
                }
              }}
              placeholder="New function name (only if it doesn't exist yet)"
            />
            <EuiButton
              size="s"
              color="primary"
              iconType="plus"
              onClick={addFunction}
              isDisabled={!newFunction.trim()}
            >
              Add
            </EuiButton>
          </div>

          <p className="cp-dept-form__note">
            Employees are assigned Functions from this same mapping in Employee Master.
          </p>
        </section>
      </EuiForm>
    </section>
  )
}
