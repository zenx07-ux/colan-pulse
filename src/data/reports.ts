export type ReportScope = 'department' | 'organization'
export type ReportCadence = 'daily' | 'weekly' | 'overnight'

export interface ScheduledReport {
  id: string
  cadence: ReportCadence
  scope: ReportScope
  title: string
  recipients: string
  schedule: string
  nextSend: string
  lastSendOk: boolean
  enabled: boolean
}

export const smtpDefaults = {
  host: 'smtp.mailhostbox.com',
  port: '587',
  security: 'starttls',
  senderName: 'ColanPulse Reports',
  timeoutSeconds: '30',
  retryCount: '3',
  backoffMinutes: '15',
  enabled: true,
  lastConnectionTest: 'Not tested this session',
  lastSuccessfulEmail:
    '26 Aug 2024, 10:02 — delivered to 4 recipients (daily Project Management)',
  lastFailedEmail:
    '25 Aug 2024, 18:41 — 535 5.7.8 authentication failed: invalid credentials',
  lastSchedulerExecution: '26 Aug 2024, 10:00 — daily batch completed',
}

export const SECURITY_MODES = [
  {
    value: 'starttls',
    text: 'STARTTLS (recommended - port 587/25)',
  },
  {
    value: 'ssl',
    text: 'SSL/TLS (port 465)',
  },
  {
    value: 'none',
    text: 'None (not recommended)',
  },
]

export const scheduledReports: ScheduledReport[] = [
  {
    id: 'daily-1',
    cadence: 'daily',
    scope: 'department',
    title: 'Project Management - PMO, Project Manager, Scrum Master',
    recipients: 'Meera Nair, Deepa Krishnan, pmo-leads@colan.com',
    schedule: '10:00 daily',
    nextSend: 'Tomorrow, 10:00',
    lastSendOk: true,
    enabled: true,
  },
  {
    id: 'daily-2',
    cadence: 'daily',
    scope: 'department',
    title: 'Engineering - Backend, Frontend, DevOps',
    recipients: 'Vikram Prasad, Sathish Kannan, eng-managers@colan.com',
    schedule: '10:00 daily',
    nextSend: 'Tomorrow, 10:00',
    lastSendOk: true,
    enabled: true,
  },
  {
    id: 'daily-3',
    cadence: 'daily',
    scope: 'department',
    title: 'Quality Assurance - Manual & Automation',
    recipients: 'Anitha Suresh, qa-leads@colan.com',
    schedule: '10:15 daily',
    nextSend: 'Tomorrow, 10:15',
    lastSendOk: true,
    enabled: true,
  },
  {
    id: 'daily-4',
    cadence: 'daily',
    scope: 'department',
    title: 'UI/UX - Design Systems & Product Design',
    recipients: 'Joseph Mathew, design-leads@colan.com',
    schedule: '09:45 daily',
    nextSend: 'Tomorrow, 09:45',
    lastSendOk: false,
    enabled: false,
  },
  {
    id: 'daily-5',
    cadence: 'daily',
    scope: 'department',
    title: 'Support - L1 / L2 Operations',
    recipients: 'Farhan Ali, support-ops@colan.com',
    schedule: '11:00 daily',
    nextSend: 'Tomorrow, 11:00',
    lastSendOk: true,
    enabled: true,
  },
  {
    id: 'daily-6',
    cadence: 'daily',
    scope: 'department',
    title: 'People Ops - HR Business Partners',
    recipients: 'hrbp@colan.com, people-ops@colan.com',
    schedule: '10:30 daily',
    nextSend: 'Tomorrow, 10:30',
    lastSendOk: true,
    enabled: true,
  },
  {
    id: 'weekly-1',
    cadence: 'weekly',
    scope: 'organization',
    title: 'All Departments',
    recipients: 'superadmin@colan.com, ops-directors@colan.com, ceo-office@colan.com',
    schedule: 'Every Monday at 10:05',
    nextSend: 'Mon, 10:05',
    lastSendOk: true,
    enabled: true,
  },
  {
    id: 'weekly-2',
    cadence: 'weekly',
    scope: 'organization',
    title: 'Leadership Rollup',
    recipients: 'leadership@colan.com, board-digest@colan.com',
    schedule: 'Every Monday at 11:00',
    nextSend: 'Mon, 11:00',
    lastSendOk: true,
    enabled: true,
  },
  {
    id: 'overnight-1',
    cadence: 'overnight',
    scope: 'organization',
    title: 'All Departments',
    recipients: 'ops-nightwatch@colan.com, facilities@colan.com',
    schedule: 'Weekdays at 08:30',
    nextSend: 'Tomorrow, 08:30',
    lastSendOk: true,
    enabled: true,
  },
]
