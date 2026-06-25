/**
 * device-poll
 * Called by the local NeuralOps app every 3 seconds.
 * Requires: anon key + X-NeuralOps-Token (install secret)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Verify install token
  const installToken = req.headers.get('x-neuralops-token')
  if (installToken !== Deno.env.get('NEURALOPS_INSTALL_TOKEN')) {
    return new Response(
      JSON.stringify({ error: 'Forbidden' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return new Response(
      JSON.stringify({ error: 'Code is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: deviceCode } = await supabase
    .from('device_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (!deviceCode) {
    return new Response(
      JSON.stringify({ status: 'not_found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (deviceCode.status === 'pending' && new Date(deviceCode.expires_at) < new Date()) {
    return new Response(
      JSON.stringify({ status: 'expired' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (deviceCode.status === 'pending') {
    return new Response(
      JSON.stringify({ status: 'pending' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (deviceCode.status === 'revoked') {
    return new Response(
      JSON.stringify({ status: 'revoked' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Active — update last_used_at and return identity
  await supabase
    .from('device_codes')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', deviceCode.id)

  return new Response(
    JSON.stringify({
      status: 'active',
      email: deviceCode.user_email,
      user_id: deviceCode.user_id,
      device_name: deviceCode.device_name,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
