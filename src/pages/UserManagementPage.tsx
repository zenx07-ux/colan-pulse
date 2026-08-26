import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EuiButton, EuiFieldSearch, EuiForm, EuiIcon } from '@elastic/eui'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { FilterPopover } from '../components/FilterPopover'
import { employees as seedEmployees, jobFunction } from '../data/employees'
import type { Employee } from '../types'

function unique(values: string[]) {
  return Array.from(new Set(values)).sort()
}

export function UserManagementPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState(seedEmployees)
  const [query, setQuery] = useState('')
  const [manager, setManager] = useState('')
  const [department, setDepartment] = useState('')
  const [fn, setFn] = useState('')
  const [teamLead, setTeamLead] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [designation, setDesignation] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  const managers = unique(records.map((employee) => employee.manager).filter(Boolean))
  const functions = unique(records.map(jobFunction))
  const teamLeads = unique(records.map((employee) => employee.teamLead).filter(Boolean))
  const locations = unique(records.map((employee) => employee.location))
  const workModes = unique(records.map((employee) => employee.workMode))
  const designations = unique(records.map((employee) => employee.role))

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return records.filter((employee) => {
      if (manager && employee.manager !== manager) return false
      if (department && employee.department !== department) return false
      if (fn && jobFunction(employee) !== fn) return false
      if (teamLead && employee.teamLead !== teamLead) return false
      if (location && employee.location !== location) return false
      if (workMode && employee.workMode !== workMode) return false
      if (designation && employee.role !== designation) return false
      if (!normalized) return true
      return [
        employee.name,
        employee.id,
        employee.email,
        employee.role,
        employee.department,
        employee.manager,
        employee.teamLead,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    })
  }, [
    department,
    designation,
    fn,
    location,
    manager,
    query,
    records,
    teamLead,
    workMode,
  ])

  function removeEmployee(employee: Employee) {
    const confirmed = window.confirm(`Delete ${employee.name} from Employee Master?`)
    if (!confirmed) return
    setRecords((current) => current.filter((item) => item.id !== employee.id))
  }

  function resendInstallEmail(employee: Employee) {
    setNotice(`Agent installation email resent to ${employee.email}.`)
    window.setTimeout(() => setNotice(null), 4000)
  }

  const columns: Array<DataTableColumn<Employee>> = [
    {
      id: 'id',
      label: 'Employee ID',
      sortValue: (employee) => employee.id,
      render: (employee) => (
        <button
          type="button"
          className="cp-name cp-mono"
          onClick={() => navigate(`/user-management/${employee.id}`)}
        >
          {employee.id}
        </button>
      ),
    },
    {
      id: 'name',
      label: 'Name',
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
      id: 'department',
      label: 'Department',
      sortValue: (employee) => employee.department,
      render: (employee) => employee.department,
    },
    {
      id: 'teamLead',
      label: 'Team Lead',
      sortValue: (employee) => employee.teamLead,
      render: (employee) => employee.teamLead || '—',
    },
    {
      id: 'manager',
      label: 'Manager',
      sortValue: (employee) => employee.manager,
      render: (employee) => employee.manager || '—',
    },
    {
      id: 'action',
      label: 'Actions',
      align: 'center',
      sortable: false,
      render: (employee) => (
        <span className="cp-action-pair">
          <button
            type="button"
            className="cp-eye-btn"
            aria-label={`Resend agent email to ${employee.name}`}
            onClick={(event) => {
              event.stopPropagation()
              resendInstallEmail(employee)
            }}
          >
            <EuiIcon type="email" size="s" />
          </button>
          <button
            type="button"
            className="cp-eye-btn"
            aria-label={`Edit ${employee.name}`}
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/user-management/${employee.id}`)
            }}
          >
            <EuiIcon type="pencil" size="s" />
          </button>
          <button
            type="button"
            className="cp-eye-btn cp-eye-btn--danger"
            aria-label={`Delete ${employee.name}`}
            onClick={(event) => {
              event.stopPropagation()
              removeEmployee(employee)
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
        <h1 className="cp-activity-title">Employee Master</h1>
        <div className="cp-incident-head__action">
          <EuiButton
            size="s"
            fill
            color="success"
            iconType="plus"
            onClick={() => navigate('/user-management/new')}
          >
            Create Employee
          </EuiButton>
        </div>
      </div>

      <section className="cp-card cp-master-table">
        <EuiForm css={{ margin: 0 }}>
          <div className="cp-activity-toolbar">
            <EuiFieldSearch
              compressed
              fullWidth
              incremental
              isClearable
              placeholder="Search by name, ID, username..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search employees"
            />
          </div>
          <div className="cp-activity-filters cp-activity-filters--7">
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
              options={unique(records.map((employee) => employee.department))}
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
            <FilterPopover
              label="Designation"
              placeholder="All Designations"
              options={designations}
              value={designation}
              onChange={setDesignation}
            />
          </div>
        </EuiForm>
        <DataTable
          items={filtered}
          columns={columns}
          getRowId={(employee) => employee.id}
          pageSize={8}
          defaultSort={{ id: 'name', direction: 'asc' }}
          empty="No employees match. Try clearing search or widening the filters."
        />
      </section>

      {notice ? (
        <div className="cp-toast" role="status">
          <EuiIcon type="check" size="s" color="success" />
          <span>{notice}</span>
        </div>
      ) : null}
    </section>
  )
}
