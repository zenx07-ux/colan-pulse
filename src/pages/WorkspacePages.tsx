import {
  EuiBadge,
  EuiEmptyPrompt,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui'
import { PageHeading } from '../components/PageHeading'
import { employees } from '../data/employees'

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

export function CategoriesPage() {
  const apps = employees
    .map((employee) => employee.currentApp)
    .filter((value): value is string => Boolean(value))
  const unique = Array.from(new Set(apps))

  return (
    <>
      <PageHeading
        title="Categories"
        description="Application categories observed from agent telemetry."
      />
      <EuiSpacer />
      {unique.length === 0 ? (
        <EuiEmptyPrompt iconType="tableOfContents" title={<h3>No active apps</h3>} />
      ) : (
        <EuiFlexGroup wrap>
          {unique.map((app) => (
            <EuiFlexItem key={app} grow={false}>
              <EuiBadge color="primary">{app}</EuiBadge>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      )}
    </>
  )
}
