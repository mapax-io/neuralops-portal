/**
 * device-request
 * Called by the local NeuralOps app on first boot.
 * Requires: anon key + X-NeuralOps-Token (install secret)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let part1 = ''
  let part2 = ''
  for (let i = 0; i < 4; i++) {
    part1 += chars[Math.floor(Math.random() * chars.length)]
    part2 += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${part1}-${part2}`
}

Deno.serve(async (req) => {
  // Verify install token
  const installToken = req.headers.get('x-neuralops-token')
  if (installToken !== Deno.env.get('NEURALOPS_INSTALL_TOKEN')) {
    return new Response(
      JSON.stringify({ error: 'Forbidden' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const body = await req.json().catch(() => ({}))
  const deviceName = body.device_name || 'Unknown Device'
  const deviceIp = req.headers.get('x-forwarded-for') || null

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  const { error } = await supabase
    .from('device_codes')
    .insert({
      code,
      device_name: deviceName,
      device_ip: deviceIp,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate code' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ code, expires_in: 300, expires_at: expiresAt.toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
