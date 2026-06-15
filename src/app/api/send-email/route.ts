import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { type, ...fields } = await req.json() as Record<string, string>

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
      <p style="color:#888;font-size:13px;margin-bottom:4px;">Ny forespørsel fra kokeliko.no</p>
      <h2 style="margin:0 0 20px;font-size:18px;">${typeLabels[type] ?? type}</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>
    </div>
  `
}
