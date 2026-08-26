import { useMemo, useState } from 'react'
import {
  EuiDatePicker,
  EuiFieldSearch,
  EuiForm,
  EuiIcon,
  EuiProgress,
} from '@elastic/eui'
import type { Moment } from 'moment'
import moment from 'moment'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { FilterPopover } from '../components/FilterPopover'
import { FormField } from '../components/FormField'
import { ProductivityDetailDrawer } from '../components/ProductivityDetailDrawer'
import { employees } from '../data/employees'
import { formatHms, seededSeconds } from '../utils/format'
import type { Employee } from '../types'

function jobFunction(employee: Employee) {
  if (employee.department === 'UI/UX') return 'Design'
  if (employee.department === 'Quality Assurance') return 'QA'
  return employee.department
}

function isOnline(employee: Employee) {
  return employee.status !== 'offline'
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort()
}

function seedMod(seed: string, mod: number) {
  return seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % mod
}

function productivityPct(employee: Employee) {
  const fraction = seedMod(employee.id, 100) / 100
  return Math.min(99.99, employee.score + fraction)
}

function workMinutes(employee: Employee) {
  return Math.max(0, 480 - employee.idleMinutes)
}

function appsUsed(employee: Employee) {
  return 4 + seedMod(employee.id + employee.name, 22)
}

function clockFromSeed(seed: string, baseHour: number) {
  const hour = baseHour + seedMod(seed, 3)
  const minute = seedMod(seed.split('').reverse().join(''), 60)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function firstIn(employee: Employee) {
  if (!isOnline(employee) && employee.idleMinutes > 90) return null
  return clockFromSeed(employee.id, 9)
}

function lastOut(employee: Employee) {
  if (!isOnline(employee) && employee.idleMinutes > 90) return null
  return clockFromSeed(employee.name, 17)
}

export function ProductivityPage() {
  const [query, setQuery] = useState('')
  const [manager, setManager] = useState('')
  const [department, setDepartment] = useState('')
  const [fn, setFn] = useState('')
  const [teamLead, setTeamLead] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [date, setDate] = useState<Moment | null>(moment())
  const [selected, setSelected] = useState<Employee | null>(null)

  const managers = unique(employees.map((employee) => employee.manager).filter(Boolean))
  const functions = unique(employees.map(jobFunction))
  const teamLeads = unique(employees.map((employee) => employee.teamLead).filter(Boolean))
  const locations = unique(employees.map((employee) => employee.location))
  const workModes = unique(employees.map((employee) => employee.workMode))

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return employees.filter((employee) => {
      if (manager && employee.manager !== manager) return false
      if (department && employee.department !== department) return false
      if (fn && jobFunction(employee) !== fn) return false
      if (teamLead && employee.teamLead !== teamLead) return false
      if (location && employee.location !== location) return false
      if (workMode && employee.workMode !== workMode) return false
      if (!normalized) return true
      return [employee.name, employee.id, employee.email, employee.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    })
  }, [department, fn, location, manager, query, teamLead, workMode])

  const columns: Array<DataTableColumn<Employee>> = [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee) => (
        <div className="cp-cell-stack">
          <strong style={{ color: 'var(--cp-heading)' }}>{employee.name}</strong>
          <span className="cp-emp-id">{employee.id}</span>
        </div>
      ),
    },
    {
      id: 'role',
      label: 'Designation',
      sortValue: (employee) => employee.role,
      render: (employee) => employee.role,
    },
    {
      id: 'status',
      label: 'Status',
      sortValue: (employee) => (isOnline(employee) ? 'online' : 'offline'),
      render: (employee) => (
        <span
          className={`cp-status ${isOnline(employee) ? 'cp-status--active' : 'cp-status--offline'}`}
        >
          <span className="cp-status__dot" />
          {isOnline(employee) ? 'Online' : 'Offline'}
        </span>
      ),
    },
    {
      id: 'workHours',
      label: 'Work Hours',
      align: 'right',
      sortValue: (employee) => workMinutes(employee),
      render: (employee) => (
        <span className="cp-mono">
          {formatHms(seededSeconds(workMinutes(employee), employee.id))}
        </span>
      ),
    },
    {
      id: 'idleMinutes',
      label: 'Idle Time',
      align: 'right',
      sortValue: (employee) => employee.idleMinutes,
      render: (employee) => (
        <span className="cp-mono" style={{ color: 'var(--cp-danger-text)' }}>
          {formatHms(seededSeconds(employee.idleMinutes, employee.name))}
        </span>
      ),
    },
    {
      id: 'firstIn',
      label: 'First In',
      align: 'right',
      sortValue: (employee) => firstIn(employee) ?? '',
      render: (employee) => (
        <span className="cp-mono" style={{ color: 'var(--cp-text-sub)' }}>
          {firstIn(employee) ?? '--'}
        </span>
      ),
    },
    {
      id: 'lastOut',
      label: 'Last Out',
      align: 'right',
      sortValue: (employee) => lastOut(employee) ?? '',
      render: (employee) => (
        <span className="cp-mono" style={{ color: 'var(--cp-text-sub)' }}>
          {lastOut(employee) ?? '--'}
        </span>
      ),
    },
    {
      id: 'productivity',
      label: 'Productivity',
      sortValue: (employee) => productivityPct(employee),
      render: (employee) => {
        const value = productivityPct(employee)
        return (
          <div className="cp-prod-meter">
            <EuiProgress
              value={value}
              max={100}
              size="s"
              color={value >= 75 ? 'success' : 'warning'}
            />
            <span
              className="cp-mono cp-prod-meter__value"
              style={{
                color: value >= 75 ? 'var(--cp-success-text)' : 'var(--cp-warning-text)',
              }}
            >
              {value.toFixed(2)}%
            </span>
          </div>
        )
      },
    },
    {
      id: 'aiUsage',
      label: 'AI Usage',
      align: 'right',
      sortValue: (employee) => employee.aiUsage ?? 0,
      render: (employee) => (
        <span className="cp-ai-pill">
          {employee.aiUsage == null ? '—' : `${employee.aiUsage.toFixed(2)}%`}
        </span>
      ),
    },
    {
      id: 'appsUsed',
      label: 'Apps Used',
      align: 'right',
      sortValue: (employee) => appsUsed(employee),
      render: (employee) => (
        <button
          type="button"
          className="cp-apps-link"
          onClick={(event) => {
            event.stopPropagation()
            setSelected(employee)
          }}
        >
          {appsUsed(employee)}
        </button>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      align: 'center',
      sortable: false,
      render: (employee) => (
        <button
          type="button"
          className="cp-eye-btn"
          aria-label={`View ${employee.name}`}
          onClick={(event) => {
            event.stopPropagation()
            setSelected(employee)
          }}
        >
          <EuiIcon type="eye" size="s" />
        </button>
      ),
    },
  ]

  return (
    <>
      <section className="cp-card cp-activity">
        <div className="cp-activity-head">
          <h1 className="cp-activity-title">Employee Productivity</h1>
          <span className="cp-count-pill">{filtered.length} employees</span>
        </div>

        <EuiForm css={{ margin: 0 }}>
          <div className="cp-activity-filters cp-activity-filters--prod">
            <FilterPopover
              label="Manager"
              placeholder="All Managers"
              options={managers}
              value={manager}
              onChange={setManager}
            />
            <FilterPopover
              label="Department"
              placeholder="All Departments"
              options={unique(employees.map((employee) => employee.department))}
              value={department}
              onChange={setDepartment}
            />
            <FilterPopover
              label="Function"
              placeholder="All Functions"
              options={functions}
              value={fn}
              onChange={setFn}
            />
            <FilterPopover
              label="Team Lead"
              placeholder="All Team Leads"
              options={teamLeads}
              value={teamLead}
              onChange={setTeamLead}
            />
            <FilterPopover
              label="Location"
              placeholder="All Locations"
              options={locations}
              value={location}
              onChange={setLocation}
            />
            <FilterPopover
              label="Work mode"
              placeholder="All Work Modes"
              options={workModes}
              value={workMode}
              onChange={setWorkMode}
            />
            <FormField className="cp-filter" label="Date" fullWidth>
              <EuiDatePicker
                compressed
                fullWidth
                selected={date}
                onChange={setDate}
                onClear={() => setDate(null)}
                placeholder="Date"
                dateFormat="DD - MM - YYYY"
              />
            </FormField>
          </div>

          <div className="cp-activity-toolbar">
            <EuiFieldSearch
              compressed
              fullWidth
              incremental
              isClearable
              placeholder="Search by name, ID, email, or designation..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search employees"
            />
          </div>
        </EuiForm>

        <DataTable
          items={filtered}
          columns={columns}
          getRowId={(employee) => employee.id}
          pageSize={10}
          defaultSort={{ id: 'name', direction: 'asc' }}
          empty="No employees match. Try clearing search or widening the filters."
          onRowClick={(employee) => setSelected(employee)}
        />
      </section>

      {selected ? (
        <ProductivityDetailDrawer employee={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  )
}
