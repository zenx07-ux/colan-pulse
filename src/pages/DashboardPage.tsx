import { useMemo, useState } from 'react'
import {
  EuiButton,
  EuiButtonGroup,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
  EuiText,
} from '@elastic/eui'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { EmployeeFlyout } from '../components/EmployeeFlyout'
import { FilterPopover } from '../components/FilterPopover'
import { IdleDonut } from '../components/IdleDonut'
import { PersonCell } from '../components/PersonCell'
import { StatusBadge } from '../components/StatusBadge'
import {
  PRODUCTIVITY_TARGET,
  RANGE_LABEL,
  RANGE_MULTIPLIER,
  departments,
} from '../data/departments'
import { employees } from '../data/employees'
import { formatIdle } from '../utils/format'
import type { Employee, TimeRange } from '../types'

const VIS = ['#61A2FF', '#16C5C0', '#EAAE01', '#EE72A6', '#F6726A']
const RANGES: TimeRange[] = ['Today', '7 days', '30 days', 'QTD']

type TabId = 'overview' | 'departments' | 'idle'

export function DashboardPage() {
  const [tab, setTab] = useState<TabId>('overview')
  const [range, setRange] = useState<TimeRange>('Today')
  const [dept, setDept] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Employee | null>(null)
  const [nonce, setNonce] = useState(0)

  const multiplier = RANGE_MULTIPLIER[range]
  const scopedDepartments =
    dept === ''
      ? departments
      : departments.filter((item) => item.name === dept)
  const scopedPeople = employees.filter(
    (employee) => dept === '' || employee.department === dept,
  )

  const active = scopedPeople.filter((employee) => employee.status === 'active').length
  const idle = scopedPeople.filter((employee) => employee.status === 'idle').length
  const offline = scopedPeople.filter((employee) => employee.status === 'offline').length
  const idleTotal = scopedDepartments.reduce((sum, item) => sum + item.idle, 0)
  const headcount = scopedDepartments.reduce((sum, item) => sum + item.people, 0) || 1
  const avgScore =
    scopedDepartments.reduce((sum, item) => sum + item.score * item.people, 0) / headcount

  const filteredPeople = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scopedPeople.filter(
      (employee) =>
        !q ||
        employee.name.toLowerCase().includes(q) ||
        employee.role.toLowerCase().includes(q),
    )
  }, [query, scopedPeople])

  const columns: Array<DataTableColumn<Employee>> = [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee, index) => <PersonCell name={employee.name} index={index} />,
    },
    {
      id: 'role',
      label: 'Role',
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
      id: 'idleMinutes',
      label: 'Idle time',
      align: 'right',
      sortValue: (employee) => employee.idleMinutes,
      render: (employee) => (
        <span className="cp-mono">{formatIdle(employee.idleMinutes * multiplier)}</span>
      ),
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
              employee.score >= PRODUCTIVITY_TARGET
                ? 'var(--cp-success-text)'
                : 'var(--cp-warning-text)',
          }}
        >
          {employee.score}%
        </span>
      ),
    },
  ]

  const donutSlices = scopedDepartments.map((item, index) => ({
    name: item.name,
    value: formatIdle(item.idle * multiplier),
    share: idleTotal ? (item.idle * 100) / idleTotal : 0,
    color: VIS[index % VIS.length],
  }))

  return (
    <>
      <EuiFlexGroup alignItems="flexStart" justifyContent="spaceBetween" wrap>
        <EuiFlexItem grow={false}>
          <h1 className="cp-page-title">Workforce status</h1>
          <div className="cp-card-sub">
            Live agent telemetry for delivery managers and team leaders
          </div>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <div className="cp-page-controls">
            <EuiButtonGroup
              legend="Time range"
              buttonSize="compressed"
              color="text"
              type="single"
              idSelected={range}
              onChange={(id) => setRange(id as TimeRange)}
              options={RANGES.map((item) => ({ id: item, label: item }))}
            />
            <FilterPopover
              hideLabel
              label="Department"
              placeholder="All departments"
              options={departments.map((item) => item.name)}
              value={dept}
              onChange={setDept}
              fullWidth
            />
            <EuiButton
              fill
              size="s"
              iconType="refresh"
              onClick={() => setNonce((value) => value + 1)}
            >
              Refresh
            </EuiButton>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />
      <div className="cp-callout" role="status">
        <EuiIcon className="cp-callout__icon" type="warning" color="#C61E25" />
        <div>
          <div className="cp-callout__title">
            {offline} systems are offline in{' '}
            {dept === '' ? 'your organization' : dept}
          </div>
          <div className="cp-callout__body">
            Agents stopped reporting more than 30 minutes ago, so idle time is still
            accruing against those employees. Review the agent roster to reassign
            coverage.
          </div>
        </div>
      </div>

      <div className="cp-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`cp-tab${tab === 'overview' ? ' is-active' : ''}`}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          className={`cp-tab${tab === 'departments' ? ' is-active' : ''}`}
          onClick={() => setTab('departments')}
        >
          Departments
        </button>
        <button
          type="button"
          role="tab"
          className={`cp-tab${tab === 'idle' ? ' is-active' : ''}`}
          onClick={() => setTab('idle')}
        >
          Idle analysis
        </button>
      </div>

      <div className="cp-kpis cp-kpis--5">
        <Kpi
          label="Active employees"
          value={active}
          delta={active ? '+2' : '0'}
          deltaColor="var(--cp-success-text)"
          note="Reporting in last 5 min"
          dot={active ? 'var(--cp-success)' : 'var(--cp-border)'}
        />
        <Kpi
          label="Idle employees"
          value={idle}
          delta={idle ? `+${idle}` : '0'}
          deltaColor="var(--cp-warning-text)"
          note="No input over 15 min"
          dot={idle ? 'var(--cp-warning)' : 'var(--cp-border)'}
        />
        <Kpi
          label="Offline systems"
          value={offline}
          valueColor={offline ? 'var(--cp-danger-text)' : undefined}
          delta="−1"
          deltaColor="var(--cp-success-text)"
          note="Agent not responding"
          dot={offline ? 'var(--cp-danger)' : 'var(--cp-border)'}
        />
        <Kpi
          label="Total employees"
          value={scopedPeople.length}
          note={
            dept === ''
              ? `${scopedDepartments.length} departments`
              : dept
          }
          dot="var(--cp-vis2)"
        />
        <Kpi
          label="Productivity score"
          value={`${avgScore.toFixed(1)}%`}
          delta="+1.4"
          deltaColor="var(--cp-success-text)"
          note="Weighted by headcount"
          dot={
            avgScore >= PRODUCTIVITY_TARGET
              ? 'var(--cp-success)'
              : 'var(--cp-warning)'
          }
        />
      </div>

      {tab !== 'idle' ? (
        <>
          <EuiSpacer />
          <div className="cp-charts">
            <section className="cp-card">
              <div className="cp-card-head">
                <div>
                  <div className="cp-card-title">Productivity by department</div>
                  <div className="cp-card-sub">
                    Target {PRODUCTIVITY_TARGET}% · {RANGE_LABEL[range]}
                  </div>
                </div>
                <span className="cp-count-pill">
                  {scopedDepartments.length}{' '}
                  {scopedDepartments.length === 1 ? 'department' : 'departments'}
                </span>
              </div>
              <div className="cp-card-body">
                {scopedDepartments.map((item) => (
                  <div key={item.name} className="cp-prod-row">
                  <div className="cp-prod-copy">
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                    <div className="cp-card-sub">
                      {item.people} employees · {formatIdle(item.idle * multiplier)} idle
                    </div>
                  </div>
                    <div className="cp-bar-track">
                      <div
                        className="cp-bar-fill"
                        style={{
                          width: `${item.score}%`,
                          background:
                            item.score >= PRODUCTIVITY_TARGET
                              ? 'var(--cp-vis2)'
                              : 'var(--cp-vis8)',
                        }}
                      />
                      <div className="cp-bar-target" />
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: 'right',
                        color:
                          item.score >= PRODUCTIVITY_TARGET
                            ? 'var(--cp-heading)'
                            : 'var(--cp-warning-text)',
                      }}
                    >
                      {item.score}%
                    </div>
                  </div>
                ))}
                <EuiFlexGroup gutterSize="l" style={{ paddingTop: 12 }}>
                  <EuiFlexItem grow={false}>
                    <EuiText size="xs" color="subdued">
                      <span
                        style={{
                          display: 'inline-block',
                          width: 2,
                          height: 11,
                          background: 'var(--cp-border-strong)',
                          marginRight: 6,
                          verticalAlign: 'middle',
                        }}
                      />
                      Target
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiText size="xs" color="subdued">
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 8,
                          borderRadius: 999,
                          background: 'var(--cp-vis2)',
                          marginRight: 6,
                          verticalAlign: 'middle',
                        }}
                      />
                      At or above {PRODUCTIVITY_TARGET}%
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiText size="xs" color="subdued">
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 8,
                          borderRadius: 999,
                          background: 'var(--cp-vis8)',
                          marginRight: 6,
                          verticalAlign: 'middle',
                        }}
                      />
                      Below target
                    </EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            </section>
            {tab === 'overview' ? (
              <section className="cp-card">
                <div className="cp-card-head">
                  <div>
                    <div className="cp-card-title">Idle time distribution</div>
                    <div className="cp-card-sub">{RANGE_LABEL[range]}</div>
                  </div>
                  <span className="cp-count-pill" style={{ background: 'var(--cp-warning-bg)', color: 'var(--cp-warning-text)' }}>
                    {formatIdle(idleTotal * multiplier)}
                  </span>
                </div>
                <div style={{ padding: '8px 16px 16px' }}>
                  <IdleDonut
                    slices={donutSlices}
                    center={formatIdle(idleTotal * multiplier)}
                  />
                </div>
              </section>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <EuiSpacer />
          <section className="cp-card">
            <div className="cp-card-head">
              <div>
                <div className="cp-card-title">Idle time distribution</div>
                <div className="cp-card-sub">{RANGE_LABEL[range]}</div>
              </div>
            </div>
            <div style={{ padding: '8px 16px 16px' }}>
              <IdleDonut slices={donutSlices} center={formatIdle(idleTotal * multiplier)} />
            </div>
          </section>
        </>
      )}

      <EuiSpacer />
      <section className="cp-card" id="roster">
        <div className="cp-card-head">
          <div>
            <div className="cp-card-title">Agent roster</div>
            <div className="cp-card-sub">
              {filteredPeople.length} employees · select a row for session detail
              {nonce > 0 ? ` · refreshed ${nonce}×` : ''}
            </div>
          </div>
          <EuiFieldSearch
            compressed
            incremental
            isClearable
            placeholder="Search employees or roles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ width: 260 }}
          />
        </div>
        <DataTable
          items={filteredPeople}
          columns={columns}
          getRowId={(employee) => employee.id}
          onRowClick={(employee) => setSelected(employee)}
          pageSize={6}
          defaultSort={{ id: 'idleMinutes', direction: 'desc' }}
          empty="No employees match this search"
        />
      </section>

      {selected ? (
        <EmployeeFlyout employee={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  )
}

function Kpi({
  label,
  value,
  valueColor,
  delta,
  deltaColor,
  note,
  dot,
}: {
  label: string
  value: string | number
  valueColor?: string
  delta?: string
  deltaColor?: string
  note: string
  dot: string
}) {
  return (
    <div className="cp-card cp-kpi">
      <div className="cp-kpi__label">{label}</div>
      <div className="cp-kpi__row">
        <span className="cp-kpi-value" style={valueColor ? { color: valueColor } : undefined}>
          {value}
        </span>
        {delta ? (
          <span className="cp-kpi__delta" style={{ color: deltaColor }}>
            {delta}
          </span>
        ) : null}
      </div>
      <div className="cp-kpi__note">
        <span className="cp-kpi__dot" style={{ background: dot }} />
        <span>{note}</span>
      </div>
    </div>
  )
}
