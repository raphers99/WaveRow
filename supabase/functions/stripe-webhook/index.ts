import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = {
  constructEvent: async (body: string, sig: string, secret: string) => {
    // In production use: import Stripe from 'https://esm.sh/stripe@14'
    // and: stripe.webhooks.constructEvent(body, sig, secret)
    // For now this is a placeholder that parses the raw body
    return JSON.parse(body)
  }
}

serve(async (req) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  let event: Record<string, unknown>
  try {
    event = await stripe.constructEvent(body, sig, webhookSecret)
  } catch {
    return new Response('Webhook signature invalid', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const type = event.type as string
  const data = event.data as Record<string, unknown>
  const obj = data?.object as Record<string, unknown>

  // Handle payment events
  if (type === 'checkout.session.completed') {
    const metadata = obj?.metadata as Record<string, string>
    if (metadata?.listing_id && metadata?.user_id) {
      // Feature a listing on successful payment
      await supabase
        .from('listings')
        .update({ is_featured: true })
        .eq('id', metadata.listing_id)
        .eq('user_id', metadata.user_id)
    }
  }

  if (type === 'customer.subscription.deleted') {
    // Remove featured status if subscription cancelled
    const customerId = obj?.customer as string
    if (customerId) {
      // Look up user by stripe_customer_id if we add that field
      // For now a no-op
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
