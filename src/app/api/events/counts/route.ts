import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data } = await supabaseAdmin.from('event_registration').select('event_id')

  const counts: Record<string, number> = {}
  ;(data ?? []).forEach(r => { counts[r.event_id] = (counts[r.event_id] ?? 0) + 1 })

  return Response.json(counts)
}
