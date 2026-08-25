export function formatIdle(minutes: number) {
  const safe = Math.max(0, Math.round(minutes))
  const hours = Math.floor(safe / 60)
  const mins = safe % 60
  return `${hours}h ${mins}m`
}

export function formatHms(totalSeconds: number) {
  const safe = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function seededSeconds(minutes: number, seed: string) {
  const extra = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 60
  return Math.max(0, minutes) * 60 + extra
}

export function utcClock(now = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())} UTC`
}

export function formatRelative(iso: string, now = new Date()) {
  const then = new Date(iso)
  const minutes = Math.max(0, Math.round((now.getTime() - then.getTime()) / 60000))
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
