import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export const useStoreStatus = () => {
    const [isOpen, setIsOpen] = useState(false) // Default closed for safety
    const [statusText, setStatusText] = useState('Cerrado')
    const [loading, setLoading] = useState(true)
    const [schedule, setSchedule] = useState({})

    useEffect(() => {
        // Initial Fetch
        fetchStatus()

        // Realtime Subscription
        const channel = supabase
            .channel('store_status_auto')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'app_settings',
                filter: "key=eq.store_schedule"
            }, () => {
                fetchStatus()
            })
            .subscribe()

        // Interval Check (Every 30 seconds)
        const interval = setInterval(() => {
            checkAutoSchedule(schedule)
        }, 30000)

        return () => {
            supabase.removeChannel(channel)
            clearInterval(interval)
        }
    }, [schedule])

    const fetchStatus = async () => {
        try {
            const { data } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'store_schedule')
                .single()

            if (data) {
                let parsedSchedule = {}
                try {
                    parsedSchedule = typeof data.value === 'string'
                        ? JSON.parse(data.value)
                        : data.value
                } catch (e) {
                    console.error("Invalid schedule JSON", e)
                }
                setSchedule(parsedSchedule)
                checkAutoSchedule(parsedSchedule)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const checkAutoSchedule = (currentSchedule) => {
        if (!currentSchedule || Object.keys(currentSchedule).length === 0) return

        const now = new Date()
        const day = now.getDay() // 0 = Sunday
        const hours = now.getHours().toString().padStart(2, '0')
        const minutes = now.getMinutes().toString().padStart(2, '0')
        const currentTime = `${hours}:${minutes}`

        const todayConfig = currentSchedule[day]

        if (todayConfig && todayConfig.active) {
            if (currentTime >= todayConfig.start && currentTime <= todayConfig.end) {
                setIsOpen(true)
                setStatusText('Abierto')
                return
            }
        }

        setIsOpen(false)
        setStatusText('Cerrado')
    }

    return { isOpen, statusText, loading }
}
