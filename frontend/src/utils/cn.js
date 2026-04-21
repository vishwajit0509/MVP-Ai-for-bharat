export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(value) {
  if (!value) return 'Unknown'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d)
}

export function truncate(value, max) {
  const t = String(value || '')
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`
}

export function tryParse(value) {
  try { return JSON.parse(value) } catch { return {} }
}

export function titleize(str) {
  return String(str || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
