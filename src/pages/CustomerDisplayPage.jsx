import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { AnimatePresence, motion } from 'framer-motion'
import AdsCarousel from '../components/display/AdsCarousel'
import LiveCartView from '../components/display/LiveCartView'

// 5 minutes in milliseconds
const IDLE_TIMEOUT = 5 * 60 * 1000

const CustomerDisplayPage = () => {
    const [session, setSession] = useState({
        status: 'idle',
        cart_items: [],
        total: 0
    })

    // We maintain a local 'active' state based on recent updates + manual session status
    const [isIdle, setIsIdle] = useState(true)
    const lastActivityRef = useRef(Date.now())

    useEffect(() => {
        // 1. Initial Load
        fetchSession()

        // 2. Realtime Subscription
        const channel = supabase
            .channel('checkout_sessions_sync')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'checkout_sessions'
            }, (payload) => {
                handleSessionUpdate(payload.new)
            })
            .subscribe()

        // 3. Inactivity Timer Loop
        const idleCheckInterval = setInterval(() => {
            const timeSinceActivity = Date.now() - lastActivityRef.current

            // If timeout exceeded AND session is not explicitly in 'payment' mode (we don't want to hide QR if user is slow to pay)
            if (timeSinceActivity > IDLE_TIMEOUT && session.status !== 'payment') {
                if (!isIdle) setIsIdle(true)
            }
        }, 5000) // Check every 5 seconds

        return () => {
            supabase.removeChannel(channel)
            clearInterval(idleCheckInterval)
        }
    }, [])

    const fetchSession = async () => {
        const { data } = await supabase
            .from('checkout_sessions')
            .select('*')
            .limit(1)
            .single()

        if (data) handleSessionUpdate(data)
    }

    const handleSessionUpdate = (newSession) => {
        setSession(newSession)

        // If the admin pushes an update (add item, etc), we consider it ACTIVE
        // Only exceptions: if admin explicitly sets status to 'idle' (e.g. cancelled order)
        if (newSession.status !== 'idle') {
            wakeUp()
        }
    }

    const wakeUp = () => {
        lastActivityRef.current = Date.now()
        setIsIdle(false)
    }

    // Force wake up if clicks happen on the screen (e.g. customer interaction? unlikely for this screen, but good to have)
    const handleInteraction = () => {
        // wakeUp() // Optional: Enable if screen is touch interactive
    }

    return (
        <div
            className="w-screen h-screen bg-black overflow-hidden relative"
            onClick={handleInteraction}
        >
            <AnimatePresence mode="wait">
                {isIdle ? (
                    <motion.div
                        key="ads"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        <AdsCarousel />
                    </motion.div>
                ) : (
                    <motion.div
                        key="checkout"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="absolute inset-0 bg-white"
                    >
                        <LiveCartView session={session} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CustomerDisplayPage
