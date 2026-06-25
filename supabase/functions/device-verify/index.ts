/**
 * device-verify
 * Called by neuralops.app/activate after the user logs in.
 * Requires: valid user JWT
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { code } = await req.json()
  if (!code) {
    return new Response(
      JSON.stringify({ error: 'Device code is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid session' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: deviceCode, error: codeError } = await supabase
    .from('device_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single()

  if (codeError || !deviceCode) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired device code' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error: updateError } = await supabase
    .from('device_codes')
    .update({
      user_id: user.id,
      user_email: user.email,
      status: 'active',
      verified_at: new Date().toISOString(),
      last_used_at: new Date().toISOString(),
    })
    .eq('id', deviceCode.id)

  if (updateError) {
    return new Response(
      JSON.stringify({ error: 'Failed to activate device' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, device_name: deviceCode.device_name }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
