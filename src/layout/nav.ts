import type { IconType } from '@elastic/eui'

export interface NavLeaf {
  id: string
  name: string
  path: string
  icon: IconType
}

export const NAV_ITEMS: NavLeaf[] = [
  { id: 'dashboard', name: 'Dashboard', path: '/', icon: 'dashboardApp' },
  { id: 'attention', name: 'Needs Attention', path: '/needs-attention', icon: 'warning' },
  { id: 'employees', name: 'Employees', path: '/employees', icon: 'users' },
  { id: 'users', name: 'User Management', path: '/user-management', icon: 'managementApp' },
  { id: 'departments', name: 'Departments', path: '/departments', icon: 'nested' },
  { id: 'projects', name: 'Projects', path: '/projects', icon: 'folderOpen' },
  { id: 'roles', name: 'Job Roles', path: '/job-roles', icon: 'user' },
  { id: 'productivity', name: 'Employee Productivity', path: '/productivity', icon: 'visGauge' },
  { id: 'categories', name: 'Categories', path: '/categories', icon: 'tableOfContents' },
  { id: 'ai-detection', name: 'AI Assistant Detection', path: '/ai-assistant-detection', icon: 'sparkles' },
  { id: 'events', name: 'Events', path: '/events', icon: 'calendar' },
  { id: 'reports', name: 'Reports', path: '/reports', icon: 'reportingApp' },
  { id: 'alerts', name: 'Alerts', path: '/alerts', icon: 'bell' },
  { id: 'agent', name: 'Agent Health', path: '/agent-health', icon: 'monitoringApp' },
  { id: 'logs', name: 'System Logs', path: '/system-logs', icon: 'document' },
  { id: 'settings', name: 'Settings', path: '/settings', icon: 'gear' },
]

export const NAV_WIDTH = 232
