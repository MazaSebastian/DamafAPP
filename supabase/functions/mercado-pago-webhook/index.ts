import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'https://esm.sh/mercadopago@1.5.17'

// Initialize Mercado Pago
// Note: In newer MP SDKs, initialization might differ, but using this version for Deno compatibility.
// If problems arise, we can fetch payment info directly via fetch() to MP API using Access Token.

serve(async (req) => {
    try {
        const url = new URL(req.url)

        // 1. Verify Query Parameters (topic=payment or type=payment)
        const topic = url.searchParams.get('topic') || url.searchParams.get('type')
        const paymentId = url.searchParams.get('id') || url.searchParams.get('data.id')

        console.log(`Webhook Received: Topic=${topic}, ID=${paymentId}`)

        // Only process payments
        if (topic !== 'payment' || !paymentId) {
            return new Response(JSON.stringify({ message: "Ignored non-payment notification" }), { status: 200 })
        }

        // 2. Setup Supabase Admin Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 3. Fetch Payment Details from Mercado Pago
        // Using direct fetch for robustness in Edge environment
        const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')

        if (!mpAccessToken) {
            throw new Error("Missing MP_ACCESS_TOKEN")
        }

        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${mpAccessToken}`
            }
        })

        if (!mpResponse.ok) {
            console.error("Error fetching payment from MP", await mpResponse.text())
            return new Response("Error fetching payment", { status: 400 })
        }

        const paymentData = await mpResponse.json()
        console.log("Payment Status:", paymentData.status)

        // 4. Update Order based on External Reference
        const orderId = paymentData.external_reference

        if (!orderId) {
            console.error("No external_reference found in payment")
            return new Response("No order ID found", { status: 200 }) // Return 200 to stop retries
        }

        const status = paymentData.status // approved, pending, rejected

        const updateData: any = {
            payment_id: String(paymentId),
            payment_status: status,
            last_updated: new Date().toISOString()
        }

        if (status === 'approved') {
            updateData.status = 'paid' // Or 'preparing' depending on your flow
        } else if (status === 'cancelled' || status === 'rejected') {
            updateData.status = 'cancelled'
        }

        // Update the order
        const { data: order, error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single()

        if (updateError) {
            console.error("Error updating order:", updateError)
            throw updateError
        }

        // 5. Award Loyalty Stars (If Approved and Not already awarded)
        if (status === 'approved' && order && !order.stars_awarded && order.user_id) {
            // Logic: 1 Star = $1 (Simple for testing)
            // Ensure total is valid
            const amount = Number(order.total) || 0
            const starsToAward = Math.floor(amount) // 1 to 1

            if (starsToAward > 0) {
                console.log(`Awarding ${starsToAward} stars to user ${order.user_id}`)

                // Call RPC function to add stars atomically
                const { error: rpcError } = await supabase
                    .rpc('award_stars', {
                        user_id: order.user_id,
                        stars_count: starsToAward
                    })

                if (!rpcError) {
                    // Mark as awarded
                    await supabase
                        .from('orders')
                        .update({ stars_awarded: true })
                        .eq('id', orderId)
                } else {
                    console.error("Error awarding stars:", rpcError)
                }
            }
        }

        return new Response(JSON.stringify({ message: "Webhook processed successfully" }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        })

    } catch (error) {
        console.error("Webhook Error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        })
    }
})
