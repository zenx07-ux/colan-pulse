import type { AppAlert } from '../types'

export const alerts: AppAlert[] = [
  {
    id: 'a1',
    title: 'Six systems offline in UI/UX',
    detail: 'No agent heartbeat since 13:32. Escalated to Agent Health.',
    time: '17:12',
    severity: 'danger',
  },
  {
    id: 'a2',
    title: 'Organization idle time above threshold',
    detail: '5h 52m logged against a 4h 00m ceiling.',
    time: '16:40',
    severity: 'warning',
  },
  {
    id: 'a3',
    title: 'Support productivity below target',
    detail: '61% against a 75% target for the third day.',
    time: '15:05',
    severity: 'default',
  },
]
