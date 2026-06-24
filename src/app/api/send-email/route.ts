import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kokeliko.no'
const LOGO_HTML = `<img src="${SITE_URL}/logo-svart.png" alt="Kokeliko" style="height:36px;width:auto;margin-bottom:20px;display:block;">`

export async function POST(req: Request) {
  const { type, ...fields } = await req.json() as Record<string, string>

  if (type === 'event_registration') return handleEventRegistration(fields)
  if (type === 'event_cancellation') return handleEventCancellation(fields)

  const subjects: Record<string, string> = {
    bordreservasjon: '♥️BORDRESERVASJON♥️',
    catering: '♥️CATERING♥️',
    lukket_selskap: '♥️LUKKET SELSKAP♥️',
  }

  try {
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
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
  const months = ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember']
  const [y, m, d] = fields.event_date.split('-').map(Number)
  const dateStr = `${d}. ${months[m - 1]} ${y}`
  const timeStr = fields.event_start_time.slice(0, 5) + (fields.event_end_time ? ` – ${fields.event_end_time.slice(0, 5)}` : '')
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
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Dato</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;color:#888;font-size:14px;">Tidspunkt</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;font-size:14px;">${timeStr}</td>
        </tr>
      </table>
      <p style="margin-top:24px;font-size:13px;color:#888;">
        Ønsker du å melde deg av? <a href="${cancelUrl}" style="color:#3d1f08;">Klikk her for å avmelde deg</a>.
      </p>
    </div>
  `

  try {
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL!,
      subject: `Påmelding bekreftet – ${fields.event_title} (${fields.epost})`,
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
  const months = ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember']
  const [y, m, d] = fields.event_date.split('-').map(Number)
  const dateStr = `${d}. ${months[m - 1]} ${y}`
  const timeStr = fields.event_start_time.slice(0, 5) + (fields.event_end_time ? ` – ${fields.event_end_time.slice(0, 5)}` : '')

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
  `

  try {
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL!,
      subject: `Avmelding bekreftet – ${fields.event_title} (${fields.epost})`,
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
        const [y, m, d] = value.split('-').map(Number)
        const months = ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember']
        value = `${d}. ${months[m - 1]} ${y}`
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
