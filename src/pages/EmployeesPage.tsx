import { useMemo, useState } from 'react'
import {
  EuiButtonGroup,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiIcon,
  EuiToolTip,
} from '@elastic/eui'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { EmployeeFlyout } from '../components/EmployeeFlyout'
import { FilterPopover } from '../components/FilterPopover'
import { PageHeading } from '../components/PageHeading'
import { employees, jobFunction } from '../data/employees'
import { formatHms, seededSeconds } from '../utils/format'
import type { Employee } from '../types'

type ConnectionFilter = 'all' | 'online' | 'offline'

function isOnline(employee: Employee) {
  return employee.status !== 'offline'
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort()
}

export function EmployeesPage() {
  const [query, setQuery] = useState('')
  const [manager, setManager] = useState('')
  const [department, setDepartment] = useState('')
  const [fn, setFn] = useState('')
  const [teamLead, setTeamLead] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [status, setStatus] = useState<ConnectionFilter>('all')
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
      if (status === 'online' && !isOnline(employee)) return false
      if (status === 'offline' && isOnline(employee)) return false
      if (!normalized) return true
      return [
        employee.name,
        employee.id,
        employee.role,
        employee.currentApp,
        employee.manager,
        employee.teamLead,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    })
  }, [department, fn, location, manager, query, status, teamLead, workMode])

  const columns: Array<DataTableColumn<Employee>> = [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee) => (
        <div className="cp-cell-stack">
          <strong style={{ color: 'var(--cp-heading)' }}>{employee.name}</strong>
          <span className="cp-emp-id">{employee.id}</span>
          <div className="cp-emp-reporting">
            <span>Manager {employee.manager || '—'}</span>
            <span>TL {employee.teamLead || '—'}</span>
          </div>
        </div>
      ),
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
      id: 'currentScreen',
      label: 'Current screen',
      sortValue: (employee) => employee.currentScreen ?? '',
      render: (employee) =>
        employee.currentScreen ? (
          <EuiToolTip content={employee.currentScreen}>
            <span className="cp-truncate">{employee.currentScreen}</span>
          </EuiToolTip>
        ) : (
          <span style={{ color: 'var(--cp-text-sub)' }}>
            {isOnline(employee) ? '—' : 'Offline'}
          </span>
        ),
    },
    {
      id: 'currentApp',
      label: 'Current app',
      sortValue: (employee) => employee.currentApp ?? '',
      render: (employee) =>
        employee.currentApp ? (
          <span className="cp-app-tag">{employee.currentApp}</span>
        ) : (
          <span style={{ color: 'var(--cp-text-sub)' }}>—</span>
        ),
    },
    {
      id: 'workTime',
      label: 'Work time',
      align: 'right',
      sortValue: (employee) => Math.max(0, 480 - employee.idleMinutes),
      render: (employee) => (
        <span className="cp-mono">
          {formatHms(seededSeconds(Math.max(0, 480 - employee.idleMinutes), employee.id))}
        </span>
      ),
    },
    {
      id: 'idleMinutes',
      label: 'Idle time',
      align: 'right',
      sortValue: (employee) => employee.idleMinutes,
      render: (employee) => (
        <span
          className="cp-mono"
          style={
            employee.idleMinutes > 15 ? { color: 'var(--cp-danger-text)' } : undefined
          }
        >
          {formatHms(seededSeconds(employee.idleMinutes, employee.name))}
        </span>
      ),
    },
    {
      id: 'aiUsage',
      label: 'AI usage',
      align: 'right',
      sortValue: (employee) => employee.aiUsage ?? 0,
      render: (employee) => (
        <span className="cp-ai-pill">
          {employee.aiUsage == null ? '—' : `${employee.aiUsage.toFixed(2)}%`}
        </span>
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
    <section className="cp-page">
      <PageHeading
        title="Employees Activity"
        description="Live presence and current application by employee."
        extra={
          <span className="cp-count-pill">Total: {filtered.length} employees</span>
        }
      />
      <EuiForm css={{ margin: 0 }}>
        <div className="cp-incident-filters">
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
        </div>
      </EuiForm>
      <section className="cp-card cp-activity">
        <div className="cp-activity-toolbar">
          <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false} wrap>
            <EuiFlexItem>
              <EuiFieldSearch
                compressed
                fullWidth
                incremental
                isClearable
                placeholder="Search by name, ID, or app..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search employees"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonGroup
                legend="Connection status"
                buttonSize="compressed"
                color="primary"
                type="single"
                idSelected={status}
                onChange={(id) => setStatus(id as ConnectionFilter)}
                options={[
                  { id: 'all', label: 'All' },
                  { id: 'online', label: 'Online' },
                  { id: 'offline', label: 'Offline' },
                ]}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
        <DataTable
          items={filtered}
          columns={columns}
          getRowId={(employee) => employee.id}
          pageSize={10}
          defaultSort={{ id: 'name', direction: 'asc' }}
          empty="No employees match. Try clearing search or widening the filters."
        />
      </section>
      {selected ? (
        <EmployeeFlyout employee={selected} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  )
}
