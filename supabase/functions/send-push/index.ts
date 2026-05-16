import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')  ?? ''
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''

webpush.setVapidDetails('mailto:app@intrun.health', VAPID_PUBLIC, VAPID_PRIVATE)

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405 })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  const sb = createClient(
    Deno.env.get('SUPABASE_URL')      ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await sb.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { score, patternMatch, title, body } = await req.json()

  const { data: subs } = await sb.from('push_subscriptions')
    .select('*').eq('user_id', user.id)

  if (!subs?.length) return new Response('No subscriptions', { status: 200, headers: corsHeaders })

  const payload = JSON.stringify({
    title: title ?? '⚠️ Alerta - Intrun',
    body:  body  ?? `Riesgo: ${score}/100`,
    data:  { score, patternMatch },
  })

  await Promise.allSettled(subs.map(async (sub: any) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        payload
      )
    } catch (e: any) {
      // Subscription expirada — limpiar
      if (e.statusCode === 410 || e.statusCode === 404) {
        await sb.from('push_subscriptions').delete().eq('id', sub.id)
      }
    }
  }))

  return new Response('OK', { status: 200, headers: corsHeaders })
})
