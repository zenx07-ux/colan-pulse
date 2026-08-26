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
import { PageHeading } from '../components/PageHeading'
import {
  aiAdoptionStats,
  aiEmployeeUsage,
  aiToolUsage,
  type AiEmployeeUsage,
  type AiToolUsage,
} from '../data/aiAdoption'

function unique(values: string[]) {
  return Array.from(new Set(values)).sort()
}

export function AiAdoptionPage() {
  const [query, setQuery] = useState('')
  const [manager, setManager] = useState('')
  const [department, setDepartment] = useState('')
  const [fn, setFn] = useState('')
  const [teamLead, setTeamLead] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [fromDate, setFromDate] = useState<Moment | null>(moment())
  const [toDate, setToDate] = useState<Moment | null>(moment())

  const managers = unique(aiEmployeeUsage.map((item) => item.manager).filter(Boolean))
  const departments = unique(aiEmployeeUsage.map((item) => item.department))
  const functions = unique(aiEmployeeUsage.map((item) => item.fn))
  const teamLeads = unique(aiEmployeeUsage.map((item) => item.teamLead).filter(Boolean))
  const locations = unique(aiEmployeeUsage.map((item) => item.location))
  const workModes = unique(aiEmployeeUsage.map((item) => item.workMode))

  const filteredPeople = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return aiEmployeeUsage.filter((item) => {
      if (manager && item.manager !== manager) return false
      if (department && item.department !== department) return false
      if (fn && item.fn !== fn) return false
      if (teamLead && item.teamLead !== teamLead) return false
      if (location && item.location !== location) return false
      if (workMode && item.workMode !== workMode) return false
      if (!normalized) return true
      return [item.name, item.id, item.role, item.department]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    })
  }, [department, fn, location, manager, query, teamLead, workMode])

  const toolColumns: Array<DataTableColumn<AiToolUsage>> = [
    {
      id: 'application',
      label: 'Application / Website',
      width: '28%',
      sortValue: (item) => item.application,
      render: (item) => (
        <span style={{ color: 'var(--cp-heading)', fontWeight: 600 }}>
          {item.application}
        </span>
      ),
    },
    {
      id: 'usageHours',
      label: 'Usage Time',
      align: 'right',
      width: '14%',
      sortValue: (item) => item.usageHours,
      render: (item) => <span>{item.usageHours.toFixed(1)}h</span>,
    },
    {
      id: 'usagePct',
      label: '% of AI Usage',
      width: '42%',
      sortValue: (item) => item.usagePct,
      render: (item) => (
        <div className="cp-ai-meter">
          <div className="cp-ai-meter__track">
            <EuiProgress value={item.usagePct} max={100} size="s" color="primary" />
          </div>
          <span className="cp-ai-meter__value">{item.usagePct.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      id: 'employeesUsing',
      label: 'Employees Using',
      align: 'right',
      width: '16%',
      sortValue: (item) => item.employeesUsing,
      render: (item) => <span>{item.employeesUsing}</span>,
    },
  ]

  const peopleColumns: Array<DataTableColumn<AiEmployeeUsage>> = [
    {
      id: 'name',
      label: 'Employee',
      sortValue: (item) => item.name,
      render: (item) => (
        <span style={{ color: 'var(--cp-heading)', fontWeight: 600 }}>{item.name}</span>
      ),
    },
    {
      id: 'role',
      label: 'Designation',
      sortValue: (item) => item.role,
      render: (item) => item.role || '—',
    },
    {
      id: 'workTime',
      label: 'Work Time',
      align: 'right',
      sortValue: (item) => item.workTimeLabel,
      render: (item) => <span>{item.workTimeLabel}</span>,
    },
    {
      id: 'productivity',
      label: 'Productivity',
      align: 'right',
      sortValue: (item) => item.productivityPct,
      render: (item) => <span>{item.productivityPct.toFixed(2)}%</span>,
    },
    {
      id: 'aiUsageHours',
      label: 'AI Usage Time',
      align: 'right',
      sortValue: (item) => item.aiUsageHours,
      render: (item) => (
        <span>
          {item.aiUsageHours >= 1
            ? `${Math.floor(item.aiUsageHours)}h ${Math.round((item.aiUsageHours % 1) * 60)}m`
            : `${Math.round(item.aiUsageHours * 60)}m`}
        </span>
      ),
    },
    {
      id: 'aiUsageScore',
      label: 'AI Usage Score',
      align: 'right',
      sortValue: (item) => item.aiUsageScore,
      render: (item) => (
        <span className="cp-ai-pill">{item.aiUsageScore.toFixed(2)}%</span>
      ),
    },
  ]

  return (
    <section className="cp-page cp-ai-page">
      <PageHeading
        title="AI Adoption"
        description="Detailed AI tool usage — which application, how much time, and productivity alongside it."
      />

      <section className="cp-card cp-ai-panel">
        <EuiForm css={{ margin: 0 }}>
          <div className="cp-page-filters">
            <div className="cp-ai-search">
              <EuiFieldSearch
                compressed
                fullWidth
                incremental
                isClearable
                placeholder="Search by employee name..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search AI adoption"
              />
            </div>

            <div className="cp-activity-filters cp-ai-filters">
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
            <FormField className="cp-filter" label="From" fullWidth>
              <EuiDatePicker
                compressed
                fullWidth
                selected={fromDate}
                onChange={setFromDate}
                onClear={() => setFromDate(null)}
                placeholder="From"
                dateFormat="DD-MM-YYYY"
              />
            </FormField>
            <FormField className="cp-filter" label="To" fullWidth>
              <EuiDatePicker
                compressed
                fullWidth
                selected={toDate}
                onChange={setToDate}
                onClear={() => setToDate(null)}
                placeholder="To"
                dateFormat="DD-MM-YYYY"
              />
            </FormField>
          </div>
          </div>
        </EuiForm>

        <div className="cp-ai-kpis">
          <article className="cp-ai-kpi">
            <div className="cp-ai-kpi__value cp-ai-kpi__value--accent">
              {aiAdoptionStats.aiUsageScore.toFixed(1)}%
            </div>
            <div className="cp-ai-kpi__label">AI Usage Score</div>
          </article>
          <article className="cp-ai-kpi">
            <div className="cp-ai-kpi__value">
              {aiAdoptionStats.employeesUsingAi} / {aiAdoptionStats.totalEmployees}
            </div>
            <div className="cp-ai-kpi__label">Employees Using AI</div>
          </article>
          <article className="cp-ai-kpi">
            <div className="cp-ai-kpi__value cp-ai-kpi__value--accent">
              {aiAdoptionStats.totalAiUsageHours.toFixed(1)}h
            </div>
            <div className="cp-ai-kpi__label">Total AI Usage Time</div>
          </article>
          <article className="cp-ai-kpi">
            <div className="cp-ai-kpi__value">
              {aiAdoptionStats.totalTrackedHours.toFixed(1)}h
            </div>
            <div className="cp-ai-kpi__label">Total Tracked Time</div>
          </article>
        </div>
      </section>

      <section className="cp-card cp-ai-table-card">
        <div className="cp-ai-table-card__head">
          <h2 className="cp-card-title cp-ai-section-title">
            <EuiIcon type="apps" size="s" />
            AI Tools — Which Application, How Much Time
          </h2>
        </div>
        <DataTable
          items={aiToolUsage}
          columns={toolColumns}
          getRowId={(item) => item.application}
          pageSize={8}
          defaultSort={{ id: 'usagePct', direction: 'desc' }}
          empty="No AI tools found for this range."
        />
      </section>

      <section className="cp-card cp-ai-table-card">
        <div className="cp-ai-table-card__head">
          <h2 className="cp-card-title cp-ai-section-title">
            <EuiIcon type="user" size="s" />
            Individual AI Usage
          </h2>
          <span className="cp-count-pill">{filteredPeople.length} employees</span>
        </div>
        <DataTable
          items={filteredPeople}
          columns={peopleColumns}
          getRowId={(item) => item.id}
          pageSize={10}
          defaultSort={{ id: 'aiUsageScore', direction: 'desc' }}
          empty="No employees match. Try clearing search or widening the filters."
        />
      </section>
    </section>
  )
}
