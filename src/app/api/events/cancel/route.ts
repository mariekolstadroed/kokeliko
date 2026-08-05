import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kokeliko.no'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return Response.json({ ok: false }, { status: 400 })

  const { data: reg } = await supabaseAdmin
    .from('event_registration')
    .select('name, email, event_id')
    .eq('cancellation_token', token)
    .single()

  if (!reg) return Response.json({ ok: false }, { status: 404 })

  const { data: ev } = await supabaseAdmin
    .from('events')
    .select('title, event_date, event_start_time, event_end_time')
    .eq('id', reg.event_id)
    .single()

  if (!ev) return Response.json({ ok: false }, { status: 500 })

  const eventStart = new Date(`${ev.event_date}T${ev.event_start_time}`)
  if (new Date() >= eventStart) {
    return Response.json({ ok: false, reason: 'started' }, { status: 409 })
  }

  const { error } = await supabaseAdmin
    .from('event_registration')
    .delete()
    .eq('cancellation_token', token)

  if (error) return Response.json({ ok: false }, { status: 500 })

  const months = ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember']
  const [y, m, d] = ev.event_date.split('-').map(Number)
  const dateStr = `${d}. ${months[m - 1]} ${y}`
  const timeStr = ev.event_start_time.slice(0, 5) + (ev.event_end_time ? ` – ${ev.event_end_time.slice(0, 5)}` : '')

  const safeTitle = escapeHtml(ev.title)
  const safeName = escapeHtml(reg.name)

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.CONTACT_EMAIL!,
    subject: `Avmelding bekreftet – ${ev.title} (${reg.email})`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;">
        <img src="${SITE_URL}/logo-svart.png" alt="Kokeliko" style="height:36px;width:auto;margin-bottom:20px;display:block;">
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
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Dato</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Tidspunkt</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${timeStr}</td>
          </tr>
        </table>
      </div>
    `,
  }).catch(() => {})

  return Response.json({ ok: true })
}
