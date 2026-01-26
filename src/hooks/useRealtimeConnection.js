import { useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '../supabaseClient'

/**
 * Hook to force data refresh when app returns to foreground or regains connection.
 * @param {Function} refreshCallback - Function to call to reload data.
 * @param {Array} dependencies - Dependencies for the useEffect (usually state variables used in refreshCallback).
 * @param {string} debugLabel - Optional label for console logging.
 * @param {number} intervalMs - Optional interval in ms for safety polling (default 0 = disabled).
 */
export const useRealtimeConnection = (refreshCallback, dependencies = [], debugLabel = 'Component', intervalMs = 0) => {
    useEffect(() => {
        const handleInteraction = () => {
            if (document.visibilityState === 'visible') {
                // console.log(`[${debugLabel}] App visible/focused: Refreshing data...`)
                refreshCallback()

                // Optional: Check Supabase connection health
                // const state = supabase.channel('ping').state
                // if (state === 'closed' || state === 'errored') {
                //     console.warn(`[${debugLabel}] Realtime seems disconnected, reconnecting...`)
                //     supabase.removeAllChannels() // Reset
                //     refreshCallback() // Fetch again
                // }
            }
        }

        const handleOnline = () => {
            console.log(`[${debugLabel}] Network Online: Refreshing...`)
            toast.success('Conexión recuperada 🌐')
            refreshCallback()
        }

        // 1. Visibility Change (Tab switch / Mobile app background-foreground)
        document.addEventListener('visibilitychange', handleInteraction)

        // 2. Focus (Window focus)
        window.addEventListener('focus', handleInteraction)

        // 3. Network Status
        window.addEventListener('online', handleOnline)

        // 4. Safety Polling (Optional)
        let intervalId = null
        if (intervalMs > 0) {
            // Detect if running in our Android Wrapper (we inject 'AndroidPrint' interface)
            const isAndroid = typeof window.AndroidPrint !== 'undefined'

            intervalId = setInterval(() => {
                // If Android, POLL ALWAYS (Aggressive mode) because visibilityState is unreliable in some WebViews
                // If Web, only poll if visible to save battery
                if (isAndroid || document.visibilityState === 'visible') {
                    // if (isAndroid) console.log(`[${debugLabel}] Android Polling Force...`)
                    refreshCallback()
                }
            }, intervalMs)
        }

        return () => {
            document.removeEventListener('visibilitychange', handleInteraction)
            window.removeEventListener('focus', handleInteraction)
            window.removeEventListener('online', handleOnline)
            if (intervalId) clearInterval(intervalId)
        }
    }, [refreshCallback, intervalMs, ...dependencies])
}
