import { DataTable, type DataTableColumn } from '../components/DataTable'
import { PageHeading } from '../components/PageHeading'
import { PersonCell } from '../components/PersonCell'
import { StatusBadge } from '../components/StatusBadge'
import { employees } from '../data/employees'
import { formatIdle } from '../utils/format'
import type { Employee } from '../types'

export function NeedsAttentionPage() {
  const items = employees.filter(
    (employee) => employee.status !== 'active' || employee.idleMinutes >= 20,
  )

  const columns: Array<DataTableColumn<Employee>> = [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee, index) => <PersonCell name={employee.name} index={index} />,
    },
    {
      id: 'id',
      label: 'ID',
      sortValue: (employee) => employee.id,
      render: (employee) => <span className="cp-mono">{employee.id}</span>,
    },
    {
      id: 'status',
      label: 'Status',
      sortValue: (employee) => employee.status,
      render: (employee) => <StatusBadge status={employee.status} />,
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
      id: 'reason',
      label: 'Reason',
      sortable: false,
      render: (employee) => (
        <span
          className={`cp-status ${
            employee.status === 'offline' ? 'cp-status--offline' : 'cp-status--idle'
          }`}
        >
          <span className="cp-status__dot" />
          {employee.status === 'offline' ? 'Agent offline' : 'High idle time'}
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeading
        title="Needs Attention"
        description="Offline agents and idle-time thresholds that need a follow-up."
      />
      <div className="cp-callout" role="status" style={{ marginTop: 16 }}>
        <div>
          <div className="cp-callout__title">
            {items.length} employees currently need attention
          </div>
          <div className="cp-callout__body">
            Offline presence is treated as an agent-health issue. Idle time over 15
            minutes during work hours is flagged separately.
          </div>
        </div>
      </div>
      <section className="cp-card" style={{ marginTop: 16 }}>
        <DataTable
          items={items}
          columns={columns}
          getRowId={(employee) => employee.id}
          pageSize={6}
          defaultSort={{ id: 'idleMinutes', direction: 'desc' }}
        />
      </section>
    </>
  )
}
