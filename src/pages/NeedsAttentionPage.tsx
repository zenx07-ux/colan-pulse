import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EuiButtonEmpty } from '@elastic/eui'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { EmployeeFlyout } from '../components/EmployeeFlyout'
import { FilterPopover } from '../components/FilterPopover'
import { PersonCell } from '../components/PersonCell'
import { departments } from '../data/departments'
import { employees } from '../data/employees'
import { formatIdle } from '../utils/format'
import type { Employee } from '../types'

const IDLE_THRESHOLD_MINUTES = 15

export function NeedsAttentionPage() {
  const navigate = useNavigate()
  const [department, setDepartment] = useState('')
  const [selected, setSelected] = useState<Employee | null>(null)

  const items = useMemo(() => {
    return employees.filter((employee) => {
      if (employee.status !== 'idle') return false
      if (employee.idleMinutes < IDLE_THRESHOLD_MINUTES) return false
      if (department && employee.department !== department) return false
      return true
    })
  }, [department])

  const columns: Array<DataTableColumn<Employee>> = [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee, index) => <PersonCell name={employee.name} index={index} />,
    },
    {
      id: 'role',
      label: 'Designation',
      sortValue: (employee) => employee.role,
      render: (employee) => employee.role || '—',
    },
    {
      id: 'idleMinutes',
      label: 'Idle time today',
      align: 'right',
      sortValue: (employee) => employee.idleMinutes,
      render: (employee) => (
        <span className="cp-mono">{formatIdle(employee.idleMinutes)}</span>
      ),
    },
  ]

  return (
    <section>
      <div className="cp-incident-head">
        <div className="cp-page-lead">
          <h1 className="cp-activity-title">Needs Attention</h1>
          <div className="cp-card-sub">
            Employees currently idle above the 15-minute threshold.
          </div>
        </div>
        <div className="cp-page-controls">
          <FilterPopover
            label="Department"
            placeholder="All departments"
            options={departments.map((item) => item.name)}
            value={department}
            onChange={setDepartment}
            fullWidth
          />
          <EuiButtonEmpty
            size="s"
            iconType="arrowLeft"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </EuiButtonEmpty>
        </div>
      </div>

      <section className="cp-card">
        <div className="cp-card-head">
          <div className="cp-title-with-dot">
            <span className="cp-status__dot" style={{ background: 'var(--cp-danger)' }} />
            <div className="cp-card-title">Idle Above Threshold</div>
          </div>
          <span className="cp-count-pill">{items.length}</span>
        </div>
        <DataTable
          items={items}
          columns={columns}
          getRowId={(employee) => employee.id}
          pageSize={10}
          defaultSort={{ id: 'idleMinutes', direction: 'desc' }}
          onRowClick={(employee) => setSelected(employee)}
          empty="No employees are above the idle threshold for this department."
        />
      </section>

      {selected ? (
        <EmployeeFlyout employee={selected} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  )
}
