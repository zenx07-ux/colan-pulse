import type { AgentErrorGroup, AgentVersionShare } from '../types'

export const agentHealthStats = {
  online: 65,
  offline: 65,
  healthy: 3,
  warning: 2,
  error: 60,
  avgCpu: '0.6%',
  avgMemory: '153.1 MB',
}

export const agentVersions: AgentVersionShare[] = [
  { version: '1.41.0', count: 62 },
  { version: '1.40.0', count: 24 },
  { version: '1.36.0', count: 12 },
  { version: '1.39.0', count: 11 },
  { version: '1.18.0', count: 1 },
  { version: '1.35.0', count: 1 },
]

export const agentErrors: AgentErrorGroup[] = [
  {
    id: 'err-1',
    name: 'TaskCanceledException',
    category: 'NETWORKFAILURE',
    count: 854,
    detail: 'A task was canceled.',
    lastHost: 'CIPL-ATC00482',
  },
  {
    id: 'err-2',
    name: 'HttpRequestException',
    category: 'NETWORKFAILURE',
    count: 612,
    detail:
      'The HTTP request failed due to an underlying issue such as timeout or lost connectivity.',
    lastHost: 'CIPL-ATC00774',
  },
  {
    id: 'err-3',
    name: 'SqlException',
    category: 'DATABASEERROR',
    count: 400,
    detail:
      'A network-related or instance-specific error occurred while establishing a connection to SQL Server.',
    lastHost: 'CIPL-CHN00844',
  },
  {
    id: 'err-4',
    name: 'TimeoutException',
    category: 'OTHER',
    count: 186,
    detail: 'The operation has timed out.',
    lastHost: 'CIPL-BLR00308',
  },
  {
    id: 'err-5',
    name: 'ObjectDisposedException',
    category: 'OTHER',
    count: 94,
    detail: 'Cannot access a disposed object.',
    lastHost: 'CIPL-HYD00412',
  },
  {
    id: 'err-6',
    name: 'SocketException',
    category: 'NETWORKFAILURE',
    count: 71,
    detail: 'An existing connection was forcibly closed by the remote host.',
    lastHost: 'CIPL-ATC00781',
  },
]
