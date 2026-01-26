import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Social Send Message Function Initialized")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { recipient_id, message_text } = await req.json()

        if (!recipient_id || !message_text) {
            throw new Error('Missing recipient_id or message_text')
        }

        // 1. Get Page Access Token from Settings
        const { data: setting } = await supabaseClient
            .from('app_settings')
            .select('value')
            .eq('key', 'instagram_access_token')
            .single()

        const accessToken = setting?.value

        if (!accessToken) {
            throw new Error('Configuration Error: Missing Instagram Access Token')
        }

        // 2. Send Message via Graph API
        const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`

        const payload = {
            recipient: { id: recipient_id },
            message: { text: message_text }
        }

        const fbResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const fbData = await fbResponse.json()

        if (!fbResponse.ok) {
            console.error('Meta API Error:', fbData)
            throw new Error(`Meta API Error: ${fbData.error?.message || 'Unknown'}`)
        }

        // 3. Save Outgoing Message to DB
        await supabaseClient
            .from('social_messages')
            .insert({
                platform: 'instagram',
                external_id: fbData.message_id,
                sender_id: 'me', // Or fetch Page ID
                recipient_id: recipient_id,
                message_text: message_text,
                direction: 'outgoing',
                status: 'replied',
                raw_data: fbData
            })

        return new Response(
            JSON.stringify({ success: true, message_id: fbData.message_id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Error sending message:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
