export type PresenceStatus = 'active' | 'idle' | 'offline'
export type WorkMode = 'Office' | 'Hybrid' | 'Remote'
export type ColorMode = 'light' | 'dark'
export type TimeRange = 'Today' | '7 days' | '30 days' | 'QTD'

export interface DepartmentStat {
  name: string
  people: number
  score: number
  idle: number
}

export type DepartmentAccountStatus = 'active' | 'inactive'

export interface DepartmentRecord {
  id: string
  name: string
  functions: string[]
  status: DepartmentAccountStatus
}

export type CategoryKind = 'application' | 'website' | 'youtube'
export type CategoryClassification = 'Productive' | 'Unproductive' | 'Neutral'
export type CategoryRuleStatus = 'Active' | 'Inactive'

export interface CategoryRule {
  id: string
  kind: CategoryKind
  name: string
  classification: CategoryClassification
  aiTool: boolean
  department: string
  functionName: string
  status: CategoryRuleStatus
  priority: number
}

export interface Employee {
  id: string
  name: string
  role: string
  department: string
  manager: string
  teamLead: string
  status: PresenceStatus
  idleMinutes: number
  score: number
  email: string
  location: string
  workMode: WorkMode
  currentScreen: string | null
  currentApp: string | null
  aiUsage: number | null
}

export interface AppAlert {
  id: string
  title: string
  detail: string
  time: string
  severity: 'danger' | 'warning' | 'default'
}

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface Incident {
  id: string
  title: string
  detectionType: string
  employee: string
  manager: string
  techLead: string
  device: string
  severity: IncidentSeverity
  read: boolean
  occurredAt: string
  warningCount: number
}

export type EventStatus = 'scheduled' | 'cancelled' | 'completed'

export interface CalendarEvent {
  id: string
  name: string
  type: string
  classification: string
  repeat: string
  date: string
  startTime: string
  endTime: string
  assignTo: string
  notes: string
  scope: string
  createdBy: string
  status: EventStatus
}

export type EventCategoryStatus = 'Active' | 'Inactive'

export interface EventCategory {
  id: string
  name: string
  classification: string
  status: EventCategoryStatus
}

export interface AgentVersionShare {
  version: string
  count: number
}

export interface AgentErrorGroup {
  id: string
  name: string
  category: string
  count: number
  detail: string
  lastHost: string
}

export type SystemLogKind = 'api' | 'agent'

export interface SystemLog {
  id: string
  kind: SystemLogKind
  exception: string
  category: string
  employeeName: string | null
  employeeId: string | null
  message: string
  detail: string
  timestamp: string
}

export interface AiAssistantTool {
  id: string
  name: string
  processNames: string[]
  executableNames: string[]
  enabled: boolean
  notes: string
}

export interface AiDiagnosticCapture {
  id: string
  employeeId: string
  employeeName: string
  capturedAt: string
  processName: string
  executableName: string
  matchedTool: string | null
}

export type AiTestConfidence = 'High' | 'Medium' | 'None'
