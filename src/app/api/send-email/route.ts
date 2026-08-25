import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL, LOGO_HTML, EMAIL_FROM, escapeHtml, formatEventDate, formatEventDateOrTBD, formatEventTimeOrTBD } from '@/lib/email'
import { validateEmail } from '@/lib/validation'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function safeReplyTo(email: string): string | undefined {
  return validateEmail(email) ? undefined : email
}

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
  if (type === 'bordreservasjon') return handleBordreservasjon(fields)

  const subjects: Record<string, string> = {
    catering: '♥️CATERING♥️',
    lukket_selskap: '♥️LUKKET SELSKAP♥️',
  }
  const manualConfirmNotes: Record<string, string> = {
    catering: 'Svar kunden for å bekrefte cateringbestillingen.',
    lukket_selskap: 'Svar kunden for å planlegge selskapet.',
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: process.env.CONTACT_EMAIL!,
      replyTo: safeReplyTo(fields.epost),
      subject: subjects[type],
      html: buildHtml(type, fields) + `<p style="margin-top:16px;font-size:13px;color:#888;">${manualConfirmNotes[type]}</p>`,
    })
    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Resend error:', err)
    return Response.json({ ok: false }, { status: 500 })
  }
}

async function handleEventRegistration(fields: Record<string, string>) {
  if (!fields.cancellation_token) return Response.json({ ok: false }, { status: 400 })

  const { data: reg } = await supabaseAdmin
    .from('event_registration')
    .select('name, email, event_id')
    .eq('cancellation_token', fields.cancellation_token)
    .single()
  if (!reg) return Response.json({ ok: false }, { status: 404 })

  const { data: ev } = await supabaseAdmin
    .from('events')
    .select('title, event_date, event_start_time, event_end_time')
    .eq('id', reg.event_id)
    .single()
  if (!ev) return Response.json({ ok: false }, { status: 500 })

  const hasDate = !!ev.event_date
  const dateStr = formatEventDateOrTBD(ev.event_date)
  const timeStr = formatEventTimeOrTBD(ev.event_start_time, ev.event_end_time)
  const safeName = escapeHtml(reg.name)
  const safeTitle = escapeHtml(ev.title)
  const cancelUrl = `${SITE_URL}/arrangementer/avmeld?token=${fields.cancellation_token}`

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;">
      ${LOGO_HTML}
      <h2 style="margin:0 0 20px;font-size:18px;color:#2E1608;">Påmelding bekreftet – ${safeTitle}</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;width:180px;font-size:14px;">Navn</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Arrangement</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${safeTitle}</td>
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
      to: reg.email,
      subject: `Påmelding bekreftet – ${ev.title}`,
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
  if (!fields.registration_id) return Response.json({ ok: false }, { status: 400 })

  const { data: reg } = await supabaseAdmin
    .from('event_registration')
    .select('name, email, event_id')
    .eq('id', fields.registration_id)
    .single()
  if (!reg) return Response.json({ ok: false }, { status: 404 })

  const { data: ev } = await supabaseAdmin
    .from('events')
    .select('title, event_date, event_start_time, event_end_time')
    .eq('id', reg.event_id)
    .single()
  if (!ev) return Response.json({ ok: false }, { status: 500 })

  const hasDate = !!ev.event_date
  const dateStr = formatEventDateOrTBD(ev.event_date)
  const timeStr = formatEventTimeOrTBD(ev.event_start_time, ev.event_end_time)
  const safeName = escapeHtml(reg.name)
  const safeTitle = escapeHtml(ev.title)

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;">
      ${LOGO_HTML}
      <h2 style="margin:0 0 20px;font-size:18px;color:#2E1608;">Du er avmeldt – ${safeTitle}</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;width:180px;font-size:14px;">Navn</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Arrangement</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${safeTitle}</td>
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
      to: reg.email,
      subject: `Avmelding bekreftet – ${ev.title}`,
      html,
    })
    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Resend error:', err)
    return Response.json({ ok: false }, { status: 500 })
  }
}

async function handleBordreservasjon(fields: Record<string, string>) {
  const confirmation = await resend.emails.send({
    from: EMAIL_FROM,
    to: fields.epost,
    replyTo: process.env.CONTACT_EMAIL!,
    subject: 'Bordreservasjonen din er bekreftet – Kokeliko',
    html: buildBordreservasjonConfirmationHtml(fields),
  })
  const confirmationOk = !confirmation.error
  if (confirmation.error) console.error('Resend error (customer confirmation):', confirmation.error)

  const followUpNote = confirmationOk
    ? '<p style="margin-top:16px;font-size:13px;color:#888;">Kunden har fått automatisk bekreftelse på e-post.</p>'
    : '<p style="margin-top:16px;font-size:13px;color:#b00020;">OBS: automatisk bekreftelse til kunden feilet å sende. Følg opp manuelt!</p>'

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: process.env.CONTACT_EMAIL!,
      replyTo: safeReplyTo(fields.epost),
      subject: '♥️BORDRESERVASJON♥️',
      html: buildHtml('bordreservasjon', fields) + followUpNote,
    })
    if (error) throw error
  } catch (err) {
    console.error('Resend error (owner notification):', err)
    return Response.json({ ok: false }, { status: 500 })
  }

  return Response.json({ ok: confirmationOk }, { status: confirmationOk ? 200 : 500 })
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

function buildRows(fields: Record<string, string>) {
  return Object.entries(fields)
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
}

function buildHtml(type: string, fields: Record<string, string>) {
  const typeLabels: Record<string, string> = {
    bordreservasjon: 'Bordreservasjon',
    catering: 'Catering',
    lukket_selskap: 'Lukket selskap',
  }

  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;">
      ${LOGO_HTML}
      <h2 style="margin:0 0 20px;font-size:18px;">${typeLabels[type] ?? type}</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        ${buildRows(fields)}
      </table>
    </div>
  `
}

function buildBordreservasjonConfirmationHtml(fields: Record<string, string>) {
  const details = Object.fromEntries(
    Object.entries(fields).filter(([key]) => key !== 'navn' && key !== 'epost')
  )

  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;">
      ${LOGO_HTML}
      <h2 style="margin:0 0 20px;font-size:18px;color:#2E1608;">Bordreservasjonen din er bekreftet!</h2>
      <p style="font-size:14px;color:#2E1608;margin:0 0 16px;">Hei ${fields.navn ?? ''},</p>
      <p style="font-size:14px;color:#2E1608;margin:0 0 16px;">Takk for bordreservasjonen din hos Kokeliko. Vi har notert:</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        ${buildRows(details)}
      </table>
      <p style="margin-top:20px;font-size:13px;color:#888;">Skulle det være noe vi må avklare med bordreservasjonen din, tar vi kontakt på denne e-posten.</p>
      <p style="margin-top:16px;font-size:14px;color:#2E1608;">Vi gleder oss til å se dere!</p>
    </div>
  `
}
