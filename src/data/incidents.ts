import type { Incident, IncidentSeverity } from '../types'

const DETECTION_TYPES = [
  'AppClosed',
  'RepetitiveKeySpam',
  'PassiveBrowserSession',
  'UnattendedSession',
  'ZeroInputWindow',
  'IdleTimeout',
  'AgentOffline',
  'ClipboardBurst',
]

const EMPLOYEES = [
  'AshokKumar U',
  'Aravind Kumar',
  'Naveen Selvam',
  'Rahul Menon',
  'Sneha Iyer',
  'Anitha Suresh',
  'Deepa Krishnan',
  'Sathish Kannan',
  'Joseph Mathew',
  'Farhan Ali',
  'Vikram Prasad',
  'Meera Nair',
  'Divya Ramesh',
  'Karthik Raja',
]

const MANAGERS = ['Vishnu K', 'Meera Nair', 'Deepa Krishnan']
const TECH_LEADS = ['Karthik Raja', 'Vikram Prasad', 'Joseph Mathew', 'Sathish Kannan', 'Anitha Suresh']

const TITLES = [
  'Agent closed by {employee}',
  'Potential automated input detected ({events} events over {seconds}s)',
  'Browser tab open for {seconds}s with zero real keyboard/mouse input.',
  'Unattended Chrome window for {seconds}s. Heartbeat present but no input samples.',
  'Figma canvas idle for {minutes} minutes while the agent still reported the design file.',
  'Teams window in foreground for {minutes} minutes with no input after handover notes.',
  'Repetitive key pattern detected — {events} identical keystrokes in {seconds}s.',
  'Clipboard burst of {events} copies in under {seconds}s during file transfer.',
  'Agent heartbeat lost on {device}; last seen mid-session.',
  'Playwright report tab idle for {minutes} minutes with no scroll or click events.',
]

function seedMod(seed: string, mod: number) {
  return seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % mod
}

function buildTitle(index: number, employee: string, device: string) {
  const template = TITLES[index % TITLES.length]
  return template
    .replace('{employee}', employee)
    .replace('{device}', device)
    .replace('{events}', String(1200 + seedMod(employee + index, 9000)))
    .replace('{seconds}', String(60 + seedMod(device + index, 500)))
    .replace('{minutes}', String(5 + seedMod(employee, 25)))
}

function severityFor(index: number): IncidentSeverity {
  if (index < 184) return index % 17 === 0 ? 'critical' : 'high'
  if (index < 200) return 'medium'
  return 'low'
}

function buildIncident(index: number): Incident {
  const employee = EMPLOYEES[index % EMPLOYEES.length]
  const manager = MANAGERS[index % MANAGERS.length]
  const techLead = TECH_LEADS[index % TECH_LEADS.length]
  const device = `CIPL-A${String(1000000 + seedMod(employee + index, 900000)).padStart(7, '0')}`
  const minutesAgo = 8 + index * 7
  const occurredAt = new Date(Date.now() - minutesAgo * 60_000).toISOString()
  const severity = severityFor(index)
  const detectionType = DETECTION_TYPES[index % DETECTION_TYPES.length]

  return {
    id: `inc-${String(index + 1).padStart(3, '0')}`,
    title: buildTitle(index, employee, device),
    detectionType,
    employee,
    manager,
    techLead,
    device,
    severity,
    read: index >= 10,
    occurredAt,
    warningCount: seedMod(device, 30),
    usagePct: 3 + seedMod(employee + detectionType, 28),
  }
}

/** Seed list sized to match Incident Center totals (~200). */
export const incidents: Incident[] = Array.from({ length: 200 }, (_, index) => buildIncident(index))
