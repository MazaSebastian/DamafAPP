
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load env
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log("Checking invoices table...")

    // 1. Check anonymous access first (if RLS allows public read, which it shouldn't)
    const { data, error } = await supabase.from('invoices').select('*')

    if (error) {
        console.error("Error fetching (Anon):", error)
    } else {
        console.log(`Fetched ${data.length} invoices (Anon).`)
        if (data.length > 0) console.log(data[0])
    }

    // 2. We can't easily check Admin access from script without logging in, 
    // but if fetching returns 0 and error is null, it might be RLS hiding it from Anon.

    // Let's check if we can replicate the BillingList fetch
    console.log("Checking fetch logic...")
}

check()
