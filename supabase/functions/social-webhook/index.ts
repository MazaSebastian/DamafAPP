import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Social Webhook Function Initialized")

serve(async (req) => {
    // 1. Setup Supabase Client
    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)

    // ----------------------------------------------------
    // GET: Webhook Verification (Hub Challenge)
    // ----------------------------------------------------
    if (req.method === 'GET') {
        const mode = url.searchParams.get('hub.mode')
        const token = url.searchParams.get('hub.verify_token')
        const challenge = url.searchParams.get('hub.challenge')

        if (mode && token) {
            // Fetch verify token from settings
            const { data: setting } = await supabaseClient
                .from('app_settings')
                .select('value')
                .eq('key', 'instagram_verify_token')
                .single()

            const validToken = setting?.value || 'damaf_secure_token_123' // Fallback

            if (mode === 'subscribe' && token === validToken) {
                console.log('WEBHOOK_VERIFIED')
                return new Response(challenge, { status: 200 })
            } else {
                return new Response('Forbidden', { status: 403 })
            }
        }
        return new Response('Bad Request', { status: 400 })
    }

    // ----------------------------------------------------
    // POST: Event Handling (Incoming Messages)
    // ----------------------------------------------------
    if (req.method === 'POST') {
        try {
            const body = await req.json()
            console.log('Webhook Body:', JSON.stringify(body))

            if (body.object === 'instagram' || body.object === 'page') {
                for (const entry of body.entry) {
                    // Messaging Events
                    if (entry.messaging) {
                        for (const event of entry.messaging) {
                            await processMessageEvent(supabaseClient, event, 'instagram')
                        }
                    }
                }
                return new Response('EVENT_RECEIVED', { status: 200 })
            }

            return new Response('Not Found', { status: 404 })

        } catch (error) {
            console.error('Error processing webhook:', error)
            return new Response('Internal Server Error', { status: 500 })
        }
    }

    return new Response('Method Not Allowed', { status: 405 })
})

async function processMessageEvent(supabase, event, platform) {
    // Check if it's a message
    if (event.message && !event.message.is_echo) {
        const senderId = event.sender.id
        const recipientId = event.recipient.id
        const messageText = event.message.text
        const messageId = event.message.mid

        // Handle attachments if any (images) - Simplified
        const mediaUrl = event.message.attachments?.[0]?.payload?.url || null

        console.log(`Received message from ${senderId}: ${messageText}`)

        // Persist to DB
        const { error } = await supabase
            .from('social_messages')
            .insert({
                platform: platform,
                external_id: messageId,
                sender_id: senderId,
                recipient_id: recipientId,
                message_text: messageText,
                media_url: mediaUrl,
                direction: 'incoming',
                status: 'received',
                raw_data: event
            })

        if (error) {
            console.error('Error saving message to DB:', error)
        }
    }
}
