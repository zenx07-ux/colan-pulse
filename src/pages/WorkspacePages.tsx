import {
  EuiBadge,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { PageHeading } from '../components/PageHeading'
import { PersonCell } from '../components/PersonCell'
import { employees } from '../data/employees'
import { formatIdle } from '../utils/format'
import type { Employee } from '../types'

export function ProjectsPage() {
  const projects = [
    { name: 'ColanPulse EUI', owner: 'Meera Nair', status: 'In progress' },
    { name: 'Agent heartbeat v2', owner: 'Sathish Kannan', status: 'At risk' },
    { name: 'Support portal', owner: 'Deepa Krishnan', status: 'On track' },
  ]

  return (
    <>
      <PageHeading
        title="Projects"
        description="Delivery workstreams that consume agent capacity."
      />
      <EuiSpacer />
      <EuiFlexGrid columns={3}>
        {projects.map((project) => (
          <EuiFlexItem key={project.name}>
            <div className="cp-card cp-kpi">
              <div className="cp-card-title">{project.name}</div>
              <div className="cp-card-sub" style={{ marginTop: 4 }}>
                {project.owner} · {project.status}
              </div>
            </div>
          </EuiFlexItem>
        ))}
      </EuiFlexGrid>
    </>
  )
}

export function JobRolesPage() {
  const roles = Array.from(new Set(employees.map((employee) => employee.role)))

  return (
    <>
      <PageHeading
        title="Job Roles"
        description="Roles currently reporting through the desktop agent."
      />
      <EuiSpacer />
      <EuiFlexGroup wrap>
        {roles.map((role) => (
          <EuiFlexItem key={role} grow={false}>
            <EuiBadge color="hollow">{role}</EuiBadge>
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </>
  )
}

export function ProductivityPage() {
  const columns: Array<DataTableColumn<Employee>> = [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee, index) => <PersonCell name={employee.name} index={index} />,
    },
    {
      id: 'score',
      label: 'Score',
      align: 'right',
      sortValue: (employee) => employee.score,
      render: (employee) => (
        <span
          className="cp-score"
          style={{
            color:
              employee.score >= 75 ? 'var(--cp-success-text)' : 'var(--cp-warning-text)',
          }}
        >
          {employee.score}%
        </span>
      ),
    },
    {
      id: 'idleMinutes',
      label: 'Idle time',
      align: 'right',
      sortValue: (employee) => employee.idleMinutes,
      render: (employee) => (
        <span className="cp-mono">{formatIdle(employee.idleMinutes)}</span>
      ),
    },
    {
      id: 'currentApp',
      label: 'Current app',
      sortValue: (employee) => employee.currentApp ?? '',
      render: (employee) => employee.currentApp ?? '—',
    },
  ]

  const topScore = Math.max(...employees.map((employee) => employee.score))
  const topIdle = Math.max(...employees.map((employee) => employee.idleMinutes))

  return (
    <>
      <PageHeading
        title="Employee Productivity"
        description="Work versus idle time for the current session."
      />
      <EuiSpacer />
      <div className="cp-kpis">
        <div className="cp-card cp-kpi">
          <div className="cp-kpi__label">Highest productivity score</div>
          <div className="cp-kpi-value">{topScore}%</div>
        </div>
        <div className="cp-card cp-kpi">
          <div className="cp-kpi__label">Highest idle time</div>
          <div className="cp-kpi-value" style={{ color: 'var(--cp-warning-text)' }}>
            {formatIdle(topIdle)}
          </div>
        </div>
      </div>
      <EuiSpacer />
      <section className="cp-card">
        <DataTable
          items={employees}
          columns={columns}
          getRowId={(employee) => employee.id}
          pageSize={6}
          defaultSort={{ id: 'score', direction: 'desc' }}
        />
      </section>
    </>
  )
}

export function ReportsPage() {
  return (
    <>
      <PageHeading
        title="Reports"
        description="Export workforce activity summaries."
      />
      <EuiSpacer />
      <EuiFlexGrid columns={2}>
        <EuiFlexItem>
          <div className="cp-card cp-kpi">
            <div className="cp-card-title">Daily activity</div>
            <div className="cp-card-sub" style={{ marginTop: 4 }}>
              Work time, idle time, and presence by employee.
            </div>
          </div>
        </EuiFlexItem>
        <EuiFlexItem>
          <div className="cp-card cp-kpi">
            <div className="cp-card-title">Productivity</div>
            <div className="cp-card-sub" style={{ marginTop: 4 }}>
              Score and idle time by department and role.
            </div>
          </div>
        </EuiFlexItem>
      </EuiFlexGrid>
    </>
  )
}
