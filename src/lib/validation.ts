export function validateEmail(v: string): string {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Ugyldig e-postadresse'
}

export function validatePhone(v: string): string {
  if (!v) return ''
  const digits = v.replace(/\D/g, '')
  return digits.length === 8 || (digits.length === 10 && digits.startsWith('47'))
    ? ''
    : 'Telefonnummer må ha 8 siffer'
}

export function validateFutureDate(v: string, allowToday = false): string {
  if (!v) return 'Dato er påkrevd'
  const selected = new Date(v)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return allowToday ? selected >= today ? '' : 'Dato kan ikke være i fortiden'
    : selected > today ? '' : 'Dato må være etter dagens dato'
}

export function validateTimeRange(v: string, min: string, max: string): string {
  if (!v) return 'Tidspunkt er påkrevd'
  return v >= min && v <= max ? '' : `Må være mellom ${min} og ${max}`
}
