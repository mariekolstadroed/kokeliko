import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { LOGO_HTML, EMAIL_FROM, escapeHtml, formatEventDateOrTBD, formatEventTimeOrTBD } from '@/lib/email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return Response.json({ ok: false }, { status: 400 })

  const { data: reg } = await supabaseAdmin
    .from('event_registration')
    .select('name, email, event_id')
    .eq('cancellation_token', token)
    .single()

  if (!reg) return Response.json({ ok: false, reason: 'not_found' }, { status: 404 })

  const { data: ev } = await supabaseAdmin
    .from('events')
    .select('title, event_date, event_start_time, event_end_time')
    .eq('id', reg.event_id)
    .single()

  if (!ev) return Response.json({ ok: false }, { status: 500 })

  if (ev.event_date && ev.event_start_time) {
    const eventStart = new Date(`${ev.event_date}T${ev.event_start_time}`)
    if (new Date() >= eventStart) {
      return Response.json({ ok: false, reason: 'started' }, { status: 409 })
    }
  }

  const { error } = await supabaseAdmin
    .from('event_registration')
    .delete()
    .eq('cancellation_token', token)

  if (error) return Response.json({ ok: false }, { status: 500 })

  const hasDate = !!ev.event_date
  const dateStr = formatEventDateOrTBD(ev.event_date)
  const timeStr = formatEventTimeOrTBD(ev.event_start_time, ev.event_end_time)

  const safeTitle = escapeHtml(ev.title)
  const safeName = escapeHtml(reg.name)

  await resend.emails.send({
    from: EMAIL_FROM,
    to: reg.email,
    subject: `Avmelding bekreftet – ${ev.title}`,
    html: `
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
    `,
  }).catch(() => {})

  return Response.json({ ok: true })
}
