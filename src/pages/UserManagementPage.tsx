import { useNavigate } from 'react-router-dom'
import { EuiIcon } from '@elastic/eui'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { PersonCell } from '../components/PersonCell'
import { StatusBadge } from '../components/StatusBadge'
import { employees } from '../data/employees'
import type { Employee } from '../types'

export function UserManagementPage() {
  const navigate = useNavigate()

  const columns: Array<DataTableColumn<Employee>> = [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee, index) => <PersonCell name={employee.name} index={index} />,
    },
    {
      id: 'id',
      label: 'Employee ID',
      sortValue: (employee) => employee.id,
      render: (employee) => <span className="cp-mono">{employee.id}</span>,
    },
    {
      id: 'email',
      label: 'Email',
      sortValue: (employee) => employee.email,
      render: (employee) => employee.email,
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
      id: 'status',
      label: 'Status',
      sortValue: (employee) => employee.status,
      render: (employee) => <StatusBadge status={employee.status} />,
    },
    {
      id: 'action',
      label: 'Actions',
      align: 'center',
      sortable: false,
      render: (employee) => (
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
      ),
    },
  ]

  return (
    <section>
      <div className="cp-incident-head">
        <div className="cp-page-lead">
          <h1 className="cp-activity-title">Employee Master</h1>
          <div className="cp-card-sub">
            One record for every person, regardless of designation.
          </div>
        </div>
      </div>
      <section className="cp-card">
        <DataTable
          items={employees}
          columns={columns}
          getRowId={(employee) => employee.id}
          pageSize={8}
          defaultSort={{ id: 'name', direction: 'asc' }}
          onRowClick={(employee) => navigate(`/user-management/${employee.id}`)}
        />
      </section>
    </section>
  )
}
