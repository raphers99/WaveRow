import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.0'

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { action } = body

    let result: unknown

    // ── Lease Analysis ────────────────────────────────────────────────
    if (action === 'analyze_lease') {
      const { lease_text } = body
      if (!lease_text) throw new Error('lease_text required')

      const message = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `You are a tenant rights expert helping college students understand their lease agreements.

Analyze this lease and return a JSON object with EXACTLY this structure:
{
  "score": <number 0-100, tenant-friendliness score>,
  "summary": "<2-3 sentence plain English summary>",
  "red_flags": ["<issue>", ...],
  "green_flags": ["<tenant benefit>", ...],
  "clauses": [
    {"title": "<clause name>", "text": "<plain English explanation>", "severity": "ok|warning|danger"},
    ...
  ],
  "recommendations": ["<actionable tip>", ...]
}

Focus on: early termination fees, security deposit terms, subletting rules, maintenance responsibilities, lease break penalties, utility responsibilities, guest policies, pet policies, renewal terms.

LEASE TEXT:
${lease_text.slice(0, 6000)}

Respond with ONLY valid JSON, no markdown.`,
        }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      result = JSON.parse(text)
    }

    // ── Scam Detection ────────────────────────────────────────────────
    else if (action === 'detect_scam') {
      const { listing } = body
      if (!listing) throw new Error('listing required')

      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `You are a scam detection system for a student housing platform. Analyze this listing and respond with ONLY valid JSON:
{
  "is_suspicious": <boolean>,
  "confidence": <number 0-100>,
  "reasons": ["<reason>", ...]
}

Red flags: price too low for area, vague description, no photos, asking for wire transfer, poor grammar, too-good-to-be-true claims.

LISTING:
Title: ${listing.title}
Rent: $${listing.rent_per_month / 100}/mo
Neighborhood: ${listing.neighborhood}
Description: ${listing.description}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}`,
        }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      result = JSON.parse(text)
    }

    // ── Listing Recommendations ───────────────────────────────────────
    else if (action === 'recommendations') {
      const { user_preferences, listings } = body
      if (!listings || !user_preferences) throw new Error('listings and user_preferences required')

      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `Based on these user preferences, rank these listing IDs from best to worst match and explain briefly.

User preferences: ${JSON.stringify(user_preferences)}
Listings: ${JSON.stringify(listings.map((l: Record<string, unknown>) => ({ id: l.id, title: l.title, rent: l.rent_per_month, neighborhood: l.neighborhood, bedrooms: l.bedrooms })))}

Respond with ONLY valid JSON:
{"ranked_ids": ["<id>", ...], "explanations": {"<id>": "<reason>"}}`,
        }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      result = JSON.parse(text)
    }

    // ── Roommate Summary ──────────────────────────────────────────────
    else if (action === 'roommate_summary') {
      const { profile } = body
      if (!profile) throw new Error('profile required')

      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `Write a friendly 2-sentence bio for a student roommate profile based on:
- Budget: $${profile.budget_min}–$${profile.budget_max}/mo
- Sleep: ${profile.sleep_schedule}
- Cleanliness: ${profile.cleanliness_level}/5
- Social: ${profile.social_level}/5
- Major: ${profile.major || 'undeclared'}
- Has pets: ${profile.has_pets}
- Raw bio: ${profile.bio || 'none provided'}

Keep it warm, honest, and 2 sentences max. Plain text only.`,
        }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      result = { summary: text.trim() }
    }

    // ── Listing Problem Checker ───────────────────────────────────────
    else if (action === 'check_listing') {
      const { listing } = body
      if (!listing) throw new Error('listing required')

      const daysOnMarket = Math.floor(
        (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )

      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 768,
        messages: [{
          role: 'user',
          content: `You are a housing safety assistant for college students. Analyze this rental listing and identify any potential problems, scams, or red flags.

Listing data:
- Title: ${listing.title}
- Price: $${Math.round(listing.rent_per_month / 100)}/mo
- Location: ${listing.neighborhood}${listing.address ? `, ${listing.address}` : ''}
- Bedrooms: ${listing.bedrooms === 0 ? 'Studio' : listing.bedrooms}
- Bathrooms: ${listing.bathrooms}
- Utilities included: ${listing.utilities_included ? 'yes' : 'no'}
- Pet friendly: ${listing.pet_friendly ? 'yes' : 'no'}
- Description: ${listing.description || 'none provided'}
- Listed for: ${daysOnMarket} days

Return ONLY valid JSON with this exact structure:
{
  "riskScore": <number 0-100, where 0 is very safe and 100 is very risky>,
  "riskLevel": "low" | "medium" | "high",
  "flags": [
    { "type": "warning" | "danger" | "info", "title": "<short title>", "detail": "<one sentence explanation>" }
  ],
  "summary": "<2 sentence plain English assessment>"
}`,
        }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      result = JSON.parse(text)
    }

    else {
      throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
