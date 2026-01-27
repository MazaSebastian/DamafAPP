
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

try {
    const envConfig = dotenv.parse(fs.readFileSync('.env'))
    for (const k in envConfig) {
        process.env[k] = envConfig[k]
    }
} catch (e) {
    console.log("No .env file found")
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log("Fetching one order to see structure...")
    const { data, error } = await supabase.from('orders').select('*').limit(1)

    if (error) {
        console.error(error)
    } else if (data.length > 0) {
        console.log("Keys in 'orders' row:", Object.keys(data[0]))
    } else {
        console.log("No orders found to check structure.")
    }
}

check()
