import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EuiButtonEmpty, EuiForm, EuiIcon, EuiSpacer, type IconType } from '@elastic/eui'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { EmployeeFlyout } from '../components/EmployeeFlyout'
import { FilterPopover } from '../components/FilterPopover'
import { IdleDonut } from '../components/IdleDonut'
import { PersonCell } from '../components/PersonCell'
import { StatusBadge } from '../components/StatusBadge'
import { PRODUCTIVITY_TARGET } from '../data/departments'
import { employees } from '../data/employees'
import { agentHealthStats, agentVersions } from '../data/agentHealth'
import { formatIdle } from '../utils/format'
import type { Employee } from '../types'

const EXPECTED_MINUTES = 480
const IDLE_THRESHOLD_MINUTES = 15
const BELOW_HOURS_MINUTES = 120
const VIS = ['#61A2FF', '#16C5C0', '#EAAE01', '#EE72A6', '#F6726A']
const VERSION_MAX = Math.max(...agentVersions.map((item) => item.count))

type TabId =
  | 'overview'
  | 'management'
  | 'hours'
  | 'attendance'
  | 'ai'
  | 'intelligence'
  | 'health'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'management', label: 'Management Analytics' },
  { id: 'hours', label: 'Productivity & Work Hours' },
  { id: 'attendance', label: 'Attendance & Exceptions' },
  { id: 'ai', label: 'AI Insights' },
  { id: 'intelligence', label: 'Productivity Intelligence' },
  { id: 'health', label: 'System Health' },
]

type AnalyticsGroup = 'department' | 'function' | 'teamLead' | 'location' | 'workMode'

const ANALYTICS_TABS: Array<{ id: AnalyticsGroup; label: string; title: string }> = [
  { id: 'department', label: 'Department', title: 'Department Performance' },
  { id: 'function', label: 'Function', title: 'Function Performance' },
  { id: 'teamLead', label: 'Team Lead', title: 'Team Lead Performance' },
  { id: 'location', label: 'Location', title: 'Location Performance' },
  { id: 'workMode', label: 'Work Mode', title: 'Work Mode Performance' },
]

function jobFunction(employee: Employee) {
  if (employee.department === 'UI/UX') return 'Design'
  if (employee.department === 'Quality Assurance') return 'QA'
  return employee.department
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort()
}

function trackedHours(employee: Employee) {
  return Math.max(0, EXPECTED_MINUTES - employee.idleMinutes) / 60
}

function formatPct(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`
}

function formatHours(value: number) {
  const rounded = Math.round(value * 10) / 10
  return `${Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)}h`
}

function formatDuration(minutes: number) {
  const safe = Math.max(0, Math.round(minutes))
  const hours = Math.floor(safe / 60)
  const mins = safe % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function workMinutes(employee: Employee) {
  return Math.max(0, EXPECTED_MINUTES - employee.idleMinutes)
}

interface GroupStat {
  name: string
  people: number
  active: number
  idle: number
  offline: number
  score: number
  idleMinutes: number
  tracked: number
  productive: number
  neutral: number
  unproductive: number
  meeting: number
  ai: number
}

function seed(value: string) {
  return value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function classifyHours(employee: Employee) {
  const tracked = trackedHours(employee)
  const n = seed(employee.id)
  const meetingShare = 0.05 + (n % 6) / 100
  const unproductiveShare = Math.min(0.2, Math.max(0.015, (100 - employee.score) / 400))
  const neutralShare = 0.03 + (n % 4) / 100
  const meeting = tracked * meetingShare
  const unproductive = tracked * unproductiveShare
  const neutral = tracked * neutralShare
  return {
    tracked,
    meeting,
    unproductive,
    neutral,
    productive: Math.max(0, tracked - meeting - unproductive - neutral),
  }
}

function productivityTone(score: number) {
  if (score >= PRODUCTIVITY_TARGET) return 'var(--cp-success-text)'
  if (score >= 50) return 'var(--cp-warning-text)'
  return 'var(--cp-danger-text)'
}

function analyticsKey(group: AnalyticsGroup, employee: Employee) {
  if (group === 'function') return jobFunction(employee)
  if (group === 'teamLead') return employee.teamLead
  if (group === 'location') return employee.location
  if (group === 'workMode') return employee.workMode || 'Unspecified'
  return employee.department
}

function groupBy(people: Employee[], keyFn: (employee: Employee) => string): GroupStat[] {
  const groups = new Map<string, GroupStat & { scoreSum: number; aiSum: number }>()

  for (const employee of people) {
    const name = keyFn(employee) || 'Unassigned'
    const hours = classifyHours(employee)
    const current = groups.get(name) ?? {
      name,
      people: 0,
      active: 0,
      idle: 0,
      offline: 0,
      score: 0,
      idleMinutes: 0,
      tracked: 0,
      productive: 0,
      neutral: 0,
      unproductive: 0,
      meeting: 0,
      ai: 0,
      scoreSum: 0,
      aiSum: 0,
    }
    current.people += 1
    if (employee.status === 'active') current.active += 1
    if (employee.status === 'idle') current.idle += 1
    if (employee.status === 'offline') current.offline += 1
    current.idleMinutes += employee.idleMinutes
    current.tracked += hours.tracked
    current.productive += hours.productive
    current.neutral += hours.neutral
    current.unproductive += hours.unproductive
    current.meeting += hours.meeting
    current.scoreSum += employee.score
    current.aiSum += employee.aiUsage ?? 0
    groups.set(name, current)
  }

  return Array.from(groups.values())
    .map(({ scoreSum, aiSum, ...item }) => ({
      ...item,
      score: item.people ? scoreSum / item.people : 0,
      ai: item.people ? aiSum / item.people : 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>('overview')
  const [manager, setManager] = useState('')
  const [department, setDepartment] = useState('')
  const [fn, setFn] = useState('')
  const [teamLead, setTeamLead] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [selected, setSelected] = useState<Employee | null>(null)
  const [analyticsGroup, setAnalyticsGroup] = useState<AnalyticsGroup>('department')
  const [trendRange, setTrendRange] = useState('7 days')

  const managers = unique(employees.map((employee) => employee.manager).filter(Boolean))
  const functions = unique(employees.map(jobFunction))
  const teamLeads = unique(employees.map((employee) => employee.teamLead).filter(Boolean))
  const locations = unique(employees.map((employee) => employee.location))
  const workModes = unique(employees.map((employee) => employee.workMode))
  const departments = unique(employees.map((employee) => employee.department))

  const scoped = useMemo(() => {
    return employees.filter((employee) => {
      if (manager && employee.manager !== manager) return false
      if (department && employee.department !== department) return false
      if (fn && jobFunction(employee) !== fn) return false
      if (teamLead && employee.teamLead !== teamLead) return false
      if (location && employee.location !== location) return false
      if (workMode && employee.workMode !== workMode) return false
      return true
    })
  }, [department, fn, location, manager, teamLead, workMode])

  const total = scoped.length
  const active = scoped.filter((employee) => employee.status === 'active').length
  const idle = scoped.filter((employee) => employee.status === 'idle').length
  const offline = scoped.filter((employee) => employee.status === 'offline').length
  const idleOver = scoped.filter(
    (employee) => employee.status === 'idle' && employee.idleMinutes >= IDLE_THRESHOLD_MINUTES,
  ).length
  const belowHours = scoped.filter((employee) => employee.idleMinutes > BELOW_HOURS_MINUTES)
  const avgScore = total
    ? scoped.reduce((sum, employee) => sum + employee.score, 0) / total
    : 0
  const attendance = total ? ((active + idle) / total) * 100 : 0
  const expectedHours = total * (EXPECTED_MINUTES / 60)
  const tracked = scoped.reduce((sum, employee) => sum + trackedHours(employee), 0)
  const aiScore = total
    ? scoped.reduce((sum, employee) => sum + (employee.aiUsage ?? 0), 0) / total
    : 0
  const attentionRequired = idleOver + offline
  const vsTarget = avgScore - PRODUCTIVITY_TARGET
  const deptStats = groupBy(scoped, (employee) => employee.department)
  const analyticsTab = ANALYTICS_TABS.find((item) => item.id === analyticsGroup) ?? ANALYTICS_TABS[0]
  const analyticsStats = groupBy(scoped, (employee) => analyticsKey(analyticsGroup, employee))
  const idleTotal = scoped.reduce((sum, employee) => sum + employee.idleMinutes, 0)
  const donutSlices = deptStats.map((item, index) => ({
    name: item.name,
    value: formatIdle(item.idleMinutes),
    share: idleTotal ? (item.idleMinutes * 100) / idleTotal : 0,
    color: VIS[index % VIS.length],
  }))
  const hourTotals = scoped.reduce(
    (sum, employee) => {
      const hours = classifyHours(employee)
      sum.productive += hours.productive
      sum.unproductive += hours.unproductive
      sum.neutral += hours.neutral
      return sum
    },
    { productive: 0, unproductive: 0, neutral: 0 },
  )
  const classifiedHours =
    hourTotals.productive + hourTotals.unproductive + hourTotals.neutral
  const productivitySlices = [
    {
      name: 'Productive',
      value: formatDuration(hourTotals.productive * 60),
      share: classifiedHours ? (hourTotals.productive * 100) / classifiedHours : 0,
      color: '#008A5E',
    },
    {
      name: 'Unproductive',
      value: formatDuration(hourTotals.unproductive * 60),
      share: classifiedHours ? (hourTotals.unproductive * 100) / classifiedHours : 0,
      color: '#C61E25',
    },
    {
      name: 'Neutral',
      value: formatDuration(hourTotals.neutral * 60),
      share: classifiedHours ? (hourTotals.neutral * 100) / classifiedHours : 0,
      color: '#A2B1C9',
    },
  ]
  const aiUsers = scoped.filter((employee) => (employee.aiUsage ?? 0) > 0)
  const agentTotal = agentHealthStats.online + agentHealthStats.offline
  const latestVersion = agentVersions[0]?.version

  return (
    <section className="cp-dash-page">
      <div className="cp-incident-head">
        <div className="cp-page-lead">
          <h1 className="cp-activity-title">Dashboard</h1>
          <div className="cp-card-sub">
            Today&apos;s workforce snapshot for managers and team leads.
          </div>
        </div>
      </div>

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
            options={departments}
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

      <EuiSpacer />

      <div className="cp-dash-kpis">
        <DashKpi
          tone="total"
          icon="users"
          value={total}
          label="Total Employees"
        />
        <DashKpi
          tone="active"
          icon="online"
          value={active}
          label="Active"
        />
        <DashKpi tone="idle" icon="clock" value={idle} label="Idle" />
        <DashKpi
          tone="offline"
          icon="offline"
          value={offline}
          label="Offline"
        />
        <DashKpi
          tone="productivity"
          icon="visLine"
          value={formatPct(avgScore)}
          label="Productivity"
        />
        <DashKpi
          tone="attendance"
          icon="calendar"
          value={formatPct(attendance)}
          label="Attendance"
        />
      </div>

      <div
        className={`cp-tabs${tab === 'management' ? ' cp-tabs--flush' : ''}`}
        role="tablist"
        aria-label="Dashboard sections"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`cp-tab${tab === item.id ? ' is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="cp-dash-split">
          <section className="cp-card">
            <div className="cp-card-head">
              <div>
                <div className="cp-card-title">Today&apos;s Management Summary</div>
                <div className="cp-card-sub">Live totals for the current filter set</div>
              </div>
            </div>
            <div className="cp-dash-summary">
              <SummaryStat
                label="Productivity"
                value={formatPct(avgScore)}
                note={
                  vsTarget < 0
                    ? `↓ ${Math.abs(vsTarget).toFixed(1)}% vs ${PRODUCTIVITY_TARGET}% target`
                    : `↑ ${vsTarget.toFixed(1)}% vs ${PRODUCTIVITY_TARGET}% target`
                }
                noteTone={vsTarget < 0 ? 'down' : 'up'}
              />
              <SummaryStat label="Attendance" value={formatPct(attendance)} />
              <SummaryStat label="Expected Hours" value={`${Math.round(expectedHours)}h`} />
              <SummaryStat label="Tracked Hours" value={formatHours(tracked)} />
              <SummaryStat label="Attention Required" value={attentionRequired} />
              <SummaryStat label="AI Usage Score" value={formatPct(aiScore)} />
            </div>
          </section>

          <section className="cp-card">
            <div className="cp-card-head">
              <div className="cp-title-with-dot">
                <EuiIcon type="warning" color="warning" />
                <div className="cp-card-title">Attention Required</div>
              </div>
              <span className="cp-count-pill">{attentionRequired}</span>
            </div>
            <div className="cp-dash-alerts">
              <button
                type="button"
                className="cp-dash-alert cp-dash-alert--danger"
                onClick={() => navigate('/needs-attention')}
              >
                <span className="cp-status__dot" style={{ background: 'var(--cp-danger)' }} />
                <span>
                  {idleOver} employee(s) - idle above threshold
                </span>
                <EuiIcon type="arrowRight" size="s" />
              </button>
              <button
                type="button"
                className="cp-dash-alert cp-dash-alert--warning"
                onClick={() => navigate('/employees')}
              >
                <span className="cp-status__dot" style={{ background: 'var(--cp-warning)' }} />
                <span>
                  {offline} system(s) offline right now
                </span>
                <EuiIcon type="arrowRight" size="s" />
              </button>
              <button
                type="button"
                className="cp-dash-alert cp-dash-alert--info"
                onClick={() => setTab('attendance')}
              >
                <EuiIcon type="help" size="s" />
                <span>
                  Below expected hours and old agent version breakdowns are on the
                  Attendance and System Health tabs
                </span>
                <EuiIcon type="arrowRight" size="s" />
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'management' ? (
        <>
          <div className="cp-tabs cp-tabs--sub" role="tablist" aria-label="Management analytics groups">
            {ANALYTICS_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={analyticsGroup === item.id}
                className={`cp-tab${analyticsGroup === item.id ? ' is-active' : ''}`}
                onClick={() => setAnalyticsGroup(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <section className="cp-card cp-analytics">
            <div className="cp-card-head">
              <div className="cp-title-with-dot">
                <EuiIcon type={analyticsGroup === 'workMode' ? 'home' : 'apps'} color="primary" />
                <div className="cp-card-title">{analyticsTab.title}</div>
              </div>
            </div>
            <DataTable
              items={analyticsStats}
              columns={analyticsColumns}
              getRowId={(item) => item.name}
              pageSize={10}
              defaultSort={{ id: 'people', direction: 'desc' }}
              empty="No groups match this filter"
            />
          </section>
        </>
      ) : null}

      {tab === 'hours' ? (
        <div className="cp-dash-stack">
          <div className="cp-dash-split">
            <section className="cp-card">
              <div className="cp-card-head">
                <div className="cp-title-with-dot">
                  <EuiIcon type="bullseye" color="danger" />
                  <div className="cp-card-title">Productivity Distribution</div>
                </div>
              </div>
              <div style={{ padding: '8px 16px 16px' }}>
                <IdleDonut
                  slices={productivitySlices}
                  center={formatDuration(classifiedHours * 60)}
                  centerLabel="Total"
                  showShare
                />
              </div>
            </section>
            <section className="cp-card">
              <div className="cp-card-head">
                <div className="cp-title-with-dot">
                  <EuiIcon type="clock" color="primary" />
                  <div className="cp-card-title">Expected vs Actual</div>
                </div>
              </div>
              <div className="cp-vs-grid">
                <div className="cp-stat">
                  <div className="cp-stat__label">Expected</div>
                  <div className="cp-stat__value">{Math.round(expectedHours)}h</div>
                </div>
                <div className="cp-stat">
                  <div className="cp-stat__label">Tracked</div>
                  <div className="cp-stat__value">{formatHours(tracked)}</div>
                </div>
                <div className="cp-stat">
                  <div className="cp-stat__label">Gap</div>
                  <div className="cp-stat__value">{formatHours(Math.max(0, expectedHours - tracked))}</div>
                </div>
              </div>
            </section>
          </div>
          <section className="cp-card">
            <div className="cp-card-head">
              <div className="cp-title-with-dot">
                <EuiIcon type="visLine" color="danger" />
                <div className="cp-card-title">Productivity Trend</div>
              </div>
              <div className="cp-range" role="group" aria-label="Trend range">
                {['7 days', '30 days', '90 days'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={trendRange === item ? 'is-active' : undefined}
                    onClick={() => setTrendRange(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="cp-trend-empty">No trend data available for this range.</div>
          </section>
        </div>
      ) : null}

      {tab === 'attendance' ? (
        <div className="cp-dash-stack">
          <div className="cp-incident-kpis">
            <DashKpi
              tone="attendance"
              icon="calendar"
              value={formatPct(attendance)}
              label="Attendance"
            />
            <DashKpi tone="offline" icon="offline" value={offline} label="Offline" />
            <DashKpi
              tone="idle"
              icon="clock"
              value={belowHours.length}
              label="Below Expected Hours"
            />
            <DashKpi
              tone="total"
              icon="users"
              value={active + idle}
              label="Present"
            />
          </div>
          <section className="cp-card">
            <div className="cp-card-head">
              <div className="cp-title-with-dot">
                <span className="cp-status__dot" style={{ background: 'var(--cp-danger)' }} />
                <div className="cp-card-title">Systems offline</div>
              </div>
              <span className="cp-count-pill">{offline}</span>
            </div>
            <DataTable
              items={scoped.filter((employee) => employee.status === 'offline')}
              columns={peopleColumns((employee) => setSelected(employee))}
              getRowId={(employee) => employee.id}
              pageSize={6}
              defaultSort={{ id: 'name', direction: 'asc' }}
              onRowClick={(employee) => setSelected(employee)}
              empty="No offline systems in this filter"
            />
          </section>
          <section className="cp-card">
            <div className="cp-card-head">
              <div className="cp-title-with-dot">
                <span className="cp-status__dot" style={{ background: 'var(--cp-warning)' }} />
                <div className="cp-card-title">Below expected hours</div>
              </div>
              <span className="cp-count-pill">{belowHours.length}</span>
            </div>
            <DataTable
              items={belowHours}
              columns={hoursExceptionColumns((employee) => setSelected(employee))}
              getRowId={(employee) => employee.id}
              pageSize={6}
              defaultSort={{ id: 'idleMinutes', direction: 'desc' }}
              onRowClick={(employee) => setSelected(employee)}
              empty="No employees are below expected hours"
            />
          </section>
        </div>
      ) : null}

      {tab === 'ai' ? (
        <section className="cp-card cp-analytics">
          <div className="cp-card-head">
            <div>
              <div className="cp-title-with-dot">
                <EuiIcon type="sparkles" color="primary" />
                <div className="cp-card-title">Individual AI Usage</div>
              </div>
              <div className="cp-card-sub">
                {aiUsers.length} of {total} employee(s) used an AI tool today
              </div>
            </div>
            <EuiButtonEmpty
              size="s"
              iconType="arrowRight"
              iconSide="right"
              onClick={() => navigate('/productivity')}
            >
              Detailed AI Adoption (by tool, by date range)
            </EuiButtonEmpty>
          </div>
          <DataTable
            items={aiUsers}
            columns={aiColumns()}
            getRowId={(employee) => employee.id}
            pageSize={10}
            defaultSort={{ id: 'aiUsage', direction: 'desc' }}
            onRowClick={(employee) => setSelected(employee)}
            empty="No employees used an AI tool in this filter"
          />
        </section>
      ) : null}

      {tab === 'intelligence' ? (
        <div className="cp-dash-stack">
          <div className="cp-dash-split">
            <section className="cp-card">
              <div className="cp-card-head">
                <div>
                  <div className="cp-card-title">Idle time distribution</div>
                  <div className="cp-card-sub">Share of idle minutes by department</div>
                </div>
                <span
                  className="cp-count-pill"
                  style={{ background: 'var(--cp-warning-bg)', color: 'var(--cp-warning-text)' }}
                >
                  {formatIdle(idleTotal)}
                </span>
              </div>
              <div style={{ padding: '8px 16px 16px' }}>
                <IdleDonut slices={donutSlices} center={formatIdle(idleTotal)} />
              </div>
            </section>
            <ScoreBars
              title="Productivity by department"
              subtitle={`Target ${PRODUCTIVITY_TARGET}%`}
              items={deptStats}
              countLabel="departments"
            />
          </div>
          <section className="cp-card cp-analytics">
            <div className="cp-card-head">
              <div className="cp-title-with-dot">
                <EuiIcon type="visGauge" color="primary" />
                <div className="cp-card-title">Employee productivity ranking</div>
              </div>
            </div>
            <DataTable
              items={scoped}
              columns={intelligenceColumns()}
              getRowId={(employee) => employee.id}
              pageSize={8}
              defaultSort={{ id: 'score', direction: 'desc' }}
              onRowClick={(employee) => setSelected(employee)}
              empty="No employees in this filter"
            />
          </section>
        </div>
      ) : null}

      {tab === 'health' ? (
        <div className="cp-dash-stack">
          <div className="cp-dash-split">
            <section className="cp-card">
              <div className="cp-card-head">
                <div className="cp-title-with-dot">
                  <EuiIcon type="user" color="primary" />
                  <div className="cp-card-title">Agent Health</div>
                </div>
              </div>
              <div className="cp-agent-counts">
                <div className="cp-agent-count cp-agent-count--total">
                  <div className="cp-agent-count__value">{agentTotal}</div>
                  <div className="cp-agent-count__label">Total agents</div>
                </div>
                <div className="cp-agent-count cp-agent-count--online">
                  <div className="cp-agent-count__value">{agentHealthStats.online}</div>
                  <div className="cp-agent-count__label">Online</div>
                </div>
                <div className="cp-agent-count cp-agent-count--offline">
                  <div className="cp-agent-count__value">{agentHealthStats.offline}</div>
                  <div className="cp-agent-count__label">Offline</div>
                </div>
              </div>
              <div className="cp-agent-status">
                <div className="cp-agent-status__item">
                  <span className="cp-agent-status__label">Healthy</span>
                  <span className="cp-agent-status__value">{agentHealthStats.healthy}</span>
                </div>
                <div className="cp-agent-status__item">
                  <span className="cp-agent-status__label">Warning</span>
                  <span className="cp-agent-status__value">{agentHealthStats.warning}</span>
                </div>
                <div className="cp-agent-status__item">
                  <span className="cp-agent-status__label">Errors</span>
                  <span className="cp-agent-status__value">{agentHealthStats.error}</span>
                </div>
              </div>
            </section>
            <section className="cp-card">
              <div className="cp-card-head">
                <div className="cp-title-with-dot">
                  <EuiIcon type="document" color="primary" />
                  <div className="cp-card-title">Version Distribution</div>
                </div>
              </div>
              <div className="cp-health-versions">
                {agentVersions.map((item) => (
                  <div key={item.version} className="cp-health-version">
                    <span className="cp-mono">{item.version}</span>
                    <div className="cp-bar-track">
                      <div
                        className="cp-bar-fill"
                        style={{
                          width: `${(item.count / VERSION_MAX) * 100}%`,
                          background:
                            item.version === latestVersion
                              ? 'var(--cp-primary)'
                              : 'var(--cp-border-strong)',
                        }}
                      />
                    </div>
                    <span className="cp-health-version__count">{item.count}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <section className="cp-card">
            <div className="cp-card-head">
              <div className="cp-title-with-dot">
                <EuiIcon type="heart" color="primary" />
                <div className="cp-card-title">Tracking Health</div>
              </div>
              <EuiButtonEmpty size="s" iconType="popout" onClick={() => navigate('/agent-health')}>
                Open Agent Health
              </EuiButtonEmpty>
            </div>
            <div className="cp-vs-grid">
              <div className="cp-stat">
                <div className="cp-stat__label">Avg CPU usage</div>
                <div className="cp-stat__value">{agentHealthStats.avgCpu}</div>
              </div>
              <div className="cp-stat">
                <div className="cp-stat__label">Avg memory</div>
                <div className="cp-stat__value">{agentHealthStats.avgMemory}</div>
              </div>
              <div className="cp-stat">
                <div className="cp-stat__label">Agents not reporting</div>
                <div className="cp-stat__value">{agentHealthStats.offline}</div>
              </div>
            </div>
            <p className="cp-track-note">
              Multi-device overlap count is on the Overview tab&apos;s Attention Required card.
              Detailed per-device breakdown (screenshot failures, API errors, update failures) is
              available on the Agent Health screen.
            </p>
          </section>
        </div>
      ) : null}

      {selected ? (
        <EmployeeFlyout employee={selected} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  )
}

function DashKpi({
  tone,
  icon,
  value,
  label,
}: {
  tone: 'total' | 'active' | 'idle' | 'offline' | 'productivity' | 'attendance'
  icon: IconType
  value: string | number
  label: string
}) {
  return (
    <div className={`cp-card cp-dash-kpi cp-dash-kpi--${tone}`}>
      <span className="cp-dash-kpi__icon">
        <EuiIcon type={icon} />
      </span>
      <div className="cp-dash-kpi__copy">
        <div className="cp-incident-kpi__value">{value}</div>
        <div className="cp-incident-kpi__label">{label}</div>
      </div>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  note,
  noteTone,
}: {
  label: string
  value: string | number
  note?: string
  noteTone?: 'up' | 'down'
}) {
  return (
    <div className="cp-stat">
      <div className="cp-stat__label">{label}</div>
      <div className="cp-stat__value">{value}</div>
      {note ? (
        <div className={`cp-dash-delta cp-dash-delta--${noteTone ?? 'down'}`}>{note}</div>
      ) : null}
    </div>
  )
}

function ScoreBars({
  title,
  subtitle,
  items,
  countLabel,
  unit = '%',
  target = PRODUCTIVITY_TARGET,
}: {
  title: string
  subtitle: string
  items: GroupStat[]
  countLabel: string
  unit?: string
  target?: number | null
}) {
  return (
    <section className="cp-card">
      <div className="cp-card-head">
        <div>
          <div className="cp-card-title">{title}</div>
          <div className="cp-card-sub">{subtitle}</div>
        </div>
        <span className="cp-count-pill">
          {items.length} {items.length === 1 ? countLabel.replace(/s$/, '') : countLabel}
        </span>
      </div>
      <div className="cp-card-body">
        {items.map((item) => {
          const above = target == null || item.score >= target
          return (
            <div key={item.name} className="cp-prod-row">
              <div className="cp-prod-copy">
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                <div className="cp-card-sub">
                  {item.people} employees · {formatIdle(item.idleMinutes)} idle
                </div>
              </div>
              <div className="cp-bar-track">
                <div
                  className="cp-bar-fill"
                  style={{
                    width: `${Math.min(100, item.score)}%`,
                    background: above ? 'var(--cp-vis2)' : 'var(--cp-vis8)',
                  }}
                />
                {target != null ? <div className="cp-bar-target" /> : null}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: 'right',
                  color: above ? 'var(--cp-heading)' : 'var(--cp-warning-text)',
                }}
              >
                {item.score.toFixed(1)}
                {unit}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function HoursCell({ value }: { value: number }) {
  return <span className="cp-mono">{formatHours(value)}</span>
}

function PercentCell({
  value,
  tone,
}: {
  value: number
  tone?: string
}) {
  return (
    <span className="cp-score" style={tone ? { color: tone } : undefined}>
      {formatPct(value, 2)}
    </span>
  )
}

const analyticsColumns: Array<DataTableColumn<GroupStat>> = [
  {
    id: 'name',
    label: 'Group',
    sortValue: (item) => item.name,
    render: (item) => (
      <span style={{ color: 'var(--cp-heading)', fontWeight: 500 }}>{item.name}</span>
    ),
  },
  {
    id: 'people',
    label: 'Employees',
    align: 'right',
    sortValue: (item) => item.people,
    render: (item) => item.people,
  },
  {
    id: 'expected',
    label: 'Expected',
    align: 'right',
    sortValue: (item) => item.people * 8,
    render: (item) => <HoursCell value={item.people * 8} />,
  },
  {
    id: 'tracked',
    label: 'Tracked',
    align: 'right',
    sortValue: (item) => item.tracked,
    render: (item) => <HoursCell value={item.tracked} />,
  },
  {
    id: 'productive',
    label: 'Productive',
    align: 'right',
    sortValue: (item) => item.productive,
    render: (item) => <HoursCell value={item.productive} />,
  },
  {
    id: 'neutral',
    label: 'Neutral',
    align: 'right',
    sortValue: (item) => item.neutral,
    render: (item) => <HoursCell value={item.neutral} />,
  },
  {
    id: 'unproductive',
    label: 'Unproductive',
    align: 'right',
    sortValue: (item) => item.unproductive,
    render: (item) => <HoursCell value={item.unproductive} />,
  },
  {
    id: 'meeting',
    label: 'Meeting',
    align: 'right',
    sortValue: (item) => item.meeting,
    render: (item) => <HoursCell value={item.meeting} />,
  },
  {
    id: 'idleMinutes',
    label: 'Idle',
    align: 'right',
    sortValue: (item) => item.idleMinutes,
    render: (item) => <HoursCell value={item.idleMinutes / 60} />,
  },
  {
    id: 'score',
    label: 'Productivity',
    align: 'right',
    sortValue: (item) => item.score,
    render: (item) => <PercentCell value={item.score} tone={productivityTone(item.score)} />,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    align: 'right',
    sortValue: (item) => (item.people ? ((item.people - item.offline) / item.people) * 100 : 0),
    render: (item) => (
      <PercentCell
        value={item.people ? ((item.people - item.offline) / item.people) * 100 : 0}
      />
    ),
  },
  {
    id: 'ai',
    label: 'AI usage score',
    align: 'right',
    sortValue: (item) => item.ai,
    render: (item) => <PercentCell value={item.ai} />,
  },
]

function peopleColumns(
  onOpen: (employee: Employee) => void,
): Array<DataTableColumn<Employee>> {
  return [
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
            onOpen(employee)
          }}
        >
          <EuiIcon type="eye" size="s" />
        </button>
      ),
    },
  ]
}

function hoursExceptionColumns(
  onOpen: (employee: Employee) => void,
): Array<DataTableColumn<Employee>> {
  return [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee, index) => <PersonCell name={employee.name} index={index} />,
    },
    {
      id: 'department',
      label: 'Department',
      sortValue: (employee) => employee.department,
      render: (employee) => employee.department,
    },
    {
      id: 'idleMinutes',
      label: 'Idle today',
      align: 'right',
      sortValue: (employee) => employee.idleMinutes,
      render: (employee) => (
        <span className="cp-mono" style={{ color: 'var(--cp-danger-text)' }}>
          {formatIdle(employee.idleMinutes)}
        </span>
      ),
    },
    {
      id: 'tracked',
      label: 'Tracked',
      align: 'right',
      sortValue: (employee) => trackedHours(employee),
      render: (employee) => (
        <span className="cp-mono">{formatHours(trackedHours(employee))}</span>
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
            onOpen(employee)
          }}
        >
          <EuiIcon type="eye" size="s" />
        </button>
      ),
    },
  ]
}

function aiColumns(): Array<DataTableColumn<Employee>> {
  return [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee) => (
        <span style={{ color: 'var(--cp-heading)', fontWeight: 500 }}>{employee.name}</span>
      ),
    },
    {
      id: 'role',
      label: 'Designation',
      sortValue: (employee) => employee.role,
      render: (employee) => employee.role || '—',
    },
    {
      id: 'workTime',
      label: 'Work time',
      align: 'right',
      sortValue: (employee) => workMinutes(employee),
      render: (employee) => (
        <span className="cp-mono">{formatDuration(workMinutes(employee))}</span>
      ),
    },
    {
      id: 'aiTime',
      label: 'AI usage time',
      align: 'right',
      sortValue: (employee) => workMinutes(employee) * ((employee.aiUsage ?? 0) / 100),
      render: (employee) => (
        <span className="cp-mono">
          {formatDuration(workMinutes(employee) * ((employee.aiUsage ?? 0) / 100))}
        </span>
      ),
    },
    {
      id: 'aiUsage',
      label: 'AI usage score',
      align: 'right',
      sortValue: (employee) => employee.aiUsage ?? 0,
      render: (employee) => (
        <span className="cp-ai-pill">
          {employee.aiUsage == null ? '—' : `${employee.aiUsage.toFixed(2)}%`}
        </span>
      ),
    },
  ]
}

function intelligenceColumns(): Array<DataTableColumn<Employee>> {
  return [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (employee) => employee.name,
      render: (employee, index) => <PersonCell name={employee.name} index={index} />,
    },
    {
      id: 'department',
      label: 'Department',
      sortValue: (employee) => employee.department,
      render: (employee) => employee.department,
    },
    {
      id: 'score',
      label: 'Productivity',
      align: 'right',
      sortValue: (employee) => employee.score,
      render: (employee) => (
        <PercentCell value={employee.score} tone={productivityTone(employee.score)} />
      ),
    },
    {
      id: 'idleMinutes',
      label: 'Idle',
      align: 'right',
      sortValue: (employee) => employee.idleMinutes,
      render: (employee) => (
        <span className="cp-mono">{formatDuration(employee.idleMinutes)}</span>
      ),
    },
    {
      id: 'tracked',
      label: 'Tracked',
      align: 'right',
      sortValue: (employee) => trackedHours(employee),
      render: (employee) => <HoursCell value={trackedHours(employee)} />,
    },
  ]
}
