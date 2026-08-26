import type { Employee, WorkMode } from '../types'
import { employees } from './employees'

export const AI_APPLICATIONS = [
  'chatgpt.com',
  'cursor',
  'claude.ai',
  'M365Copilot',
  'gemini.google.com',
  'github.com/copilot',
  'perplexity.ai',
  'midjourney.com',
] as const

export type AiApplication = (typeof AI_APPLICATIONS)[number]

export interface AiToolUsage {
  application: AiApplication
  usageHours: number
  usagePct: number
  employeesUsing: number
}

export interface AiEmployeeUsage {
  id: string
  name: string
  role: string
  department: string
  location: string
  manager: string
  teamLead: string
  workMode: WorkMode
  workTimeLabel: string
  productivityPct: number
  aiUsageHours: number
  aiUsageScore: number
  fn: string
}

function seedMod(seed: string, mod: number) {
  return seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % mod
}

function jobFunction(employee: Employee) {
  if (employee.department === 'UI/UX') return 'Design'
  if (employee.department === 'Quality Assurance') return 'QA'
  return employee.department
}

function formatHoursLabel(hours: number) {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h <= 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export const aiEmployeeUsage: AiEmployeeUsage[] = employees.map((employee) => {
  const aiUsageScore = employee.aiUsage ?? 0
  const workMinutes = Math.max(0, 480 - employee.idleMinutes)
  const workHours = workMinutes / 60
  const aiUsageHours =
    Math.round(((aiUsageScore / 100) * workHours + seedMod(employee.id, 40) / 60) * 10) / 10
  return {
    id: employee.id,
    name: employee.name,
    role: employee.role,
    department: employee.department,
    location: employee.location,
    manager: employee.manager,
    teamLead: employee.teamLead,
    workMode: employee.workMode,
    workTimeLabel: formatHoursLabel(workHours),
    productivityPct: Math.min(99.99, employee.score + seedMod(employee.id, 100) / 100),
    aiUsageHours,
    aiUsageScore,
    fn: jobFunction(employee),
  }
})

const toolWeights = [53.8, 31.9, 18.4, 12.7, 9.2, 6.8, 4.1, 2.6]

export const aiToolUsage: AiToolUsage[] = AI_APPLICATIONS.map((application, index) => {
  const usagePct = toolWeights[index] ?? Math.max(1, 20 - index * 2)
  const usageHours = Math.round((72.4 * (usagePct / 100) + seedMod(application, 9) / 10) * 10) / 10
  const employeesUsing = Math.max(
    1,
    Math.round(aiEmployeeUsage.length * (usagePct / 100) + seedMod(application, 5)),
  )
  return { application, usageHours, usagePct, employeesUsing }
})

const usingAi = aiEmployeeUsage.filter((item) => item.aiUsageScore > 0)
const totalAiHours =
  Math.round(aiEmployeeUsage.reduce((sum, item) => sum + item.aiUsageHours, 0) * 10) / 10
const totalTrackedHours =
  Math.round(
    aiEmployeeUsage.reduce((sum, item) => {
      const parts = item.workTimeLabel.match(/(\d+)h(?:\s+(\d+)m)?/)
      const hours = parts ? Number(parts[1]) + Number(parts[2] ?? 0) / 60 : 0
      return sum + hours
    }, 0) * 10,
  ) / 10

export const aiAdoptionStats = {
  aiUsageScore:
    Math.round(
      (aiEmployeeUsage.reduce((sum, item) => sum + item.aiUsageScore, 0) /
        Math.max(1, aiEmployeeUsage.length)) *
        10,
    ) / 10,
  employeesUsingAi: usingAi.length,
  totalEmployees: aiEmployeeUsage.length,
  totalAiUsageHours: totalAiHours || 72.4,
  totalTrackedHours: totalTrackedHours || 586.4,
}
