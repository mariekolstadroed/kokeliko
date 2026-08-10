import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { SITE_URL, LOGO_HTML, escapeHtml, formatEventDate, formatEventTime } from '@/lib/email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

const KINDS = new Set(['reschedule', 'info', 'cancel'])

function wrapEmail(heading: string, rows: string, message: string, cancelUrl: string | null) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;">
      ${LOGO_HTML}
      <h2 style="margin:0 0 20px;font-size:18px;color:#2E1608;">${heading}</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        ${rows}
      </table>
      <p style="font-size:14px;color:#333;">${message.replace(/\n/g, '<br>')}</p>
      ${cancelUrl ? `
      <p style="margin-top:24px;font-size:13px;color:#888;">
        Ønsker du å melde deg av? <a href="${cancelUrl}" style="color:#3d1f08;">Klikk her for å avmelde deg</a>.
      </p>` : ''}
    </div>
  `
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;width:120px;font-size:14px;">${label}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${value}</td>
    </tr>
  `
}

export async function POST(request: Request) {
  const body = await request.json() as {
    event_id?: string
    kind?: string
    message?: string
    new_date?: string
    new_start_time?: string
    new_end_time?: string | null
  }

  const { event_id, kind, message } = body
  if (!event_id || !kind || !KINDS.has(kind)) {
    return Response.json({ ok: false }, { status: 400 })
  }
  if (!message || !message.trim()) {
    return Response.json({ ok: false, error: 'message_required' }, { status: 400 })
  }
  if (kind === 'reschedule' && (!body.new_date || !body.new_start_time)) {
    return Response.json({ ok: false, error: 'new_time_required' }, { status: 400 })
  }

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('title, event_date, event_start_time, event_end_time')
    .eq('id', event_id)
    .single()

  if (!event) return Response.json({ ok: false }, { status: 404 })

  const { data: registrations } = await supabaseAdmin
    .from('event_registration')
    .select('name, email, cancellation_token')
    .eq('event_id', event_id)

  const safeTitle = escapeHtml(event.title)
  const safeMessage = escapeHtml(message.trim())

  if (kind === 'reschedule') {
    await supabaseAdmin
      .from('events')
      .update({
        event_date: body.new_date,
        event_start_time: body.new_start_time,
        event_end_time: body.new_end_time || null,
      })
      .eq('id', event_id)
  }

  if (kind === 'cancel') {
    await supabaseAdmin
      .from('events')
      .update({ published: false })
      .eq('id', event_id)
  }

  const oldDateStr = formatEventDate(event.event_date)
  const oldTimeStr = formatEventTime(event.event_start_time, event.event_end_time)

  let heading: string
  let rows: string
  let subject: string

  if (kind === 'reschedule') {
    const newDateStr = formatEventDate(body.new_date!)
    const newTimeStr = formatEventTime(body.new_start_time!, body.new_end_time ?? null)
    heading = `Ny tid – ${safeTitle}`
    subject = `Ny tid – ${event.title}`
    rows = row('Arrangement', safeTitle) + row('Tidligere', `${oldDateStr}, ${oldTimeStr}`) + row('Ny tid', `${newDateStr}, ${newTimeStr}`)
  } else if (kind === 'cancel') {
    heading = `Avlyst – ${safeTitle}`
    subject = `Avlyst – ${event.title}`
    rows = row('Arrangement', safeTitle) + row('Dato', oldDateStr) + row('Tidspunkt', oldTimeStr)
  } else {
    heading = `Oppdatering – ${safeTitle}`
    subject = `Oppdatering – ${event.title}`
    rows = row('Arrangement', safeTitle) + row('Dato', oldDateStr) + row('Tidspunkt', oldTimeStr)
  }

  const includeCancelLink = kind !== 'cancel'

  await Promise.allSettled(
    (registrations ?? []).map(reg => {
      const cancelUrl = includeCancelLink
        ? `${SITE_URL}/arrangementer/avmeld?token=${reg.cancellation_token}`
        : null
      return resend.emails.send({
        from: 'onboarding@resend.dev',
        to: reg.email,
        subject,
        html: wrapEmail(heading, rows, safeMessage, cancelUrl),
      })
    })
  )

  if (kind === 'cancel') {
    await supabaseAdmin
      .from('event_registration')
      .delete()
      .eq('event_id', event_id)
  }

  return Response.json({ ok: true, count: registrations?.length ?? 0 })
}
