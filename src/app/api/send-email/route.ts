import { Resend } from 'resend'
import { SITE_URL, LOGO_HTML, EMAIL_FROM, escapeHtml, formatEventDate, formatEventDateOrTBD, formatEventTimeOrTBD } from '@/lib/email'

const resend = new Resend(process.env.RESEND_API_KEY)

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

const ALLOWED_TYPES = new Set(['bordreservasjon', 'catering', 'lukket_selskap', 'event_registration', 'event_cancellation'])

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip)) return Response.json({ ok: false }, { status: 429 })

  const body = await req.json() as Record<string, string>
  const { type, _hp, ...rawFields } = body

  if (_hp) return Response.json({ ok: false }, { status: 400 })
  if (!ALLOWED_TYPES.has(type)) return Response.json({ ok: false }, { status: 400 })
  if (Object.values(rawFields).some(v => typeof v === 'string' && v.length > 2000)) {
    return Response.json({ ok: false }, { status: 400 })
  }

  const fields = Object.fromEntries(
    Object.entries(rawFields).map(([k, v]) => [k, typeof v === 'string' ? escapeHtml(v) : v])
  )

  if (type === 'event_registration') return handleEventRegistration(fields)
  if (type === 'event_cancellation') return handleEventCancellation(fields)

  const subjects: Record<string, string> = {
    bordreservasjon: '♥️BORDRESERVASJON♥️',
    catering: '♥️CATERING♥️',
    lukket_selskap: '♥️LUKKET SELSKAP♥️',
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: process.env.CONTACT_EMAIL!,
      replyTo: fields.epost,
      subject: subjects[type],
      html: buildHtml(type, fields),
    })
    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Resend error:', err)
    return Response.json({ ok: false }, { status: 500 })
  }
}

async function handleEventRegistration(fields: Record<string, string>) {
  const hasDate = !!fields.event_date
  const dateStr = formatEventDateOrTBD(fields.event_date || null)
  const timeStr = formatEventTimeOrTBD(fields.event_start_time || null, fields.event_end_time || null)
  const cancelUrl = `${SITE_URL}/arrangementer/avmeld?token=${fields.cancellation_token}`

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;">
      ${LOGO_HTML}
      <h2 style="margin:0 0 20px;font-size:18px;color:#2E1608;">Påmelding bekreftet – ${fields.event_title}</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;width:180px;font-size:14px;">Navn</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${fields.navn}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Arrangement</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${fields.event_title}</td>
        </tr>
        ${hasDate ? `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Dato</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Tidspunkt</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${timeStr}</td>
        </tr>` : ''}
      </table>${!hasDate ? `
      <p style="margin-top:12px;font-size:13px;color:#888;">Dato og tid kommer — du får beskjed når det er klart.</p>` : ''}
      <p style="margin-top:24px;font-size:13px;color:#888;">
        Ønsker du å melde deg av? <a href="${cancelUrl}" style="color:#3d1f08;">Klikk her for å avmelde deg</a>.
      </p>
    </div>
  `

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: fields.epost,
      subject: `Påmelding bekreftet – ${fields.event_title}`,
      html,
    })
    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Resend error:', err)
    return Response.json({ ok: false }, { status: 500 })
  }
}

async function handleEventCancellation(fields: Record<string, string>) {
  const hasDate = !!fields.event_date
  const dateStr = formatEventDateOrTBD(fields.event_date || null)
  const timeStr = formatEventTimeOrTBD(fields.event_start_time || null, fields.event_end_time || null)

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;">
      ${LOGO_HTML}
      <h2 style="margin:0 0 20px;font-size:18px;color:#2E1608;">Du er avmeldt – ${fields.event_title}</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;width:180px;font-size:14px;">Navn</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${fields.navn}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Arrangement</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${fields.event_title}</td>
        </tr>
        ${hasDate ? `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Dato</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Tidspunkt</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${timeStr}</td>
        </tr>` : ''}
      </table>
    </div>
  `

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: fields.epost,
      subject: `Avmelding bekreftet – ${fields.event_title}`,
      html,
    })
    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Resend error:', err)
    return Response.json({ ok: false }, { status: 500 })
  }
}

const LABELS: Record<string, string> = {
  navn: 'Navn',
  epost: 'E-post',
  telefon: 'Telefon',
  dato: 'Dato',
  klokkeslett: 'Klokkeslett',
  fra_kl: 'Fra kl.',
  til_kl: 'Til kl.',
  antall: 'Antall personer',
  levering: 'Levering',
  adresse: 'Leveringsadresse',
  type_arrangement: 'Type arrangement',
  tidspunkt: 'Henting/leveringstidspunkt',
  onsket_mat: 'Ønsket mat',
  annen_info: 'Annen informasjon',
  melding: 'Melding',
}

function buildHtml(type: string, fields: Record<string, string>) {
  const typeLabels: Record<string, string> = {
    bordreservasjon: 'Bordreservasjon',
    catering: 'Catering',
    lukket_selskap: 'Lukket selskap',
  }

  const rows = Object.entries(fields)
    .filter(([, value]) => value)
    .map(([key, value]) => {
      if (key === 'dato') {
        value = formatEventDate(value)
      }
      return `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;width:180px;font-size:14px;">${LABELS[key] ?? key}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${value.replace(/\n/g, '<br>')}</td>
      </tr>
    `
    }).join('')

  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;">
      ${LOGO_HTML}
      <h2 style="margin:0 0 20px;font-size:18px;">${typeLabels[type] ?? type}</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>
    </div>
  `
}
