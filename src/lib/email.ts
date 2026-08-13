export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kokeliko.no'
export const LOGO_HTML = `<img src="${SITE_URL}/logo-hvit-bakgrunn.png" alt="Kokeliko" style="height:48px;width:auto;display:block;margin-bottom:20px;">`
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Kokeliko <no-reply@mail.kokeliko.no>'

const MONTHS = ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember']

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function formatEventDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d}. ${MONTHS[m - 1]} ${y}`
}

export function formatEventTime(start: string, end: string | null): string {
  return start.slice(0, 5) + (end ? ` – ${end.slice(0, 5)}` : '')
}

export const DATE_TBD_TEXT = 'Dato og tid kommer'

export function formatEventDateOrTBD(date: string | null): string {
  return date ? formatEventDate(date) : DATE_TBD_TEXT
}

export function formatEventTimeOrTBD(start: string | null, end: string | null): string {
  return start ? formatEventTime(start, end) : DATE_TBD_TEXT
}
