import type { DepartmentStat, TimeRange } from '../types'

export const departments: DepartmentStat[] = [
  { name: 'UI/UX', people: 6, score: 71, idle: 352 },
  { name: 'Engineering', people: 24, score: 82, idle: 194 },
  { name: 'Quality Assurance', people: 11, score: 76, idle: 231 },
  { name: 'DevOps', people: 7, score: 68, idle: 288 },
  { name: 'Support', people: 9, score: 61, idle: 415 },
]

export const RANGE_MULTIPLIER: Record<TimeRange, number> = {
  Today: 1,
  '7 days': 6.4,
  '30 days': 27,
  QTD: 78,
}

export const RANGE_LABEL: Record<TimeRange, string> = {
  Today: 'Today',
  '7 days': 'Last 7 days',
  '30 days': 'Last 30 days',
  QTD: 'Quarter to date',
}

export const PRODUCTIVITY_TARGET = 75
