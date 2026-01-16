import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Clock, AlertCircle, Loader2 } from 'lucide-react'
import { format, parse, isAfter } from 'date-fns'

const DeliverySlotSelector = ({ orderType, onSlotSelect, selectedSlot }) => {
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSlots()
    }, [orderType]) // Refetch when mode changes

    const fetchSlots = async () => {
        setLoading(true)
        try {
            // 1. Get templates for this mode
            let query = supabase
                .from('production_slots')
                .select('*')
                .eq('is_active', true)
                .order('start_time')

            if (orderType === 'delivery') query = query.eq('is_delivery', true)
            else query = query.eq('is_takeaway', true)

            const { data: templates, error: templateError } = await query
            if (templateError) throw templateError

            // 2. Get current usage for today (simplified: count orders per slot_id for today)
            // Note: This requires the 'orders' table to have 'slot_id' and correct RLS/Filtering.
            // For now, we fetch ALL active orders from today to count in memory if needed, 
            // or simpler: just fetch orders created today with a slot_id.

            const todayStr = new Date().toISOString().split('T')[0]
            const { data: usageData, error: usageError } = await supabase
                .from('orders')
                .select('slot_id')
                .gte('created_at', `${todayStr}T00:00:00`)
                .not('slot_id', 'is', null)
                .neq('status', 'cancelled')
                .neq('status', 'rejected')

            if (usageError) throw usageError

            // Count usage
            const usageMap = {}
            usageData.forEach(o => {
                usageMap[o.slot_id] = (usageMap[o.slot_id] || 0) + 1
            })

            // Process slots
            const now = new Date()
            const processedSlots = templates.map(slot => {
                const [hours, minutes] = slot.start_time.split(':')
                const slotDate = new Date()
                slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

                // Past time check (allow 15 min buffer? For now strict)
                const isPast = isAfter(now, slotDate)

                // Capacity check
                const currentOrders = usageMap[slot.id] || 0
                const isFull = currentOrders >= slot.max_orders

                return {
                    ...slot,
                    isFull,
                    isPast,
                    remaining: Math.max(0, slot.max_orders - currentOrders)
                }
            })

            setSlots(processedSlots)

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="py-4 text-center"><Loader2 className="animate-spin inline text-[var(--color-primary)]" /> Cargando horarios...</div>

    const availableSlots = slots.filter(s => !s.isPast)

    if (availableSlots.length === 0) return (
        <div className="p-4 bg-orange-500/10 text-orange-400 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} /> No hay horarios disponibles para hoy.
        </div>
    )

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availableSlots.map(slot => {
                const isSelected = selectedSlot?.id === slot.id
                const disabled = slot.isFull

                return (
                    <button
                        key={slot.id}
                        onClick={() => !disabled && onSlotSelect(slot)}
                        disabled={disabled}
                        className={`
                            relative p-2 rounded-lg border text-sm font-medium transition-all
                            ${isSelected
                                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-purple-900/20'
                                : disabled
                                    ? 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
                                    : 'bg-[var(--color-surface)] border-white/10 hover:border-white/30 text-[var(--color-text-main)]'
                            }
                        `}
                    >
                        <span className="block text-center text-lg leading-tight mb-1">
                            {slot.start_time.slice(0, 5)}
                        </span>

                        {disabled ? (
                            <span className="text-[10px] uppercase font-bold text-red-500/70 block text-center">Lleno</span>
                        ) : (
                            <span className={`text-[10px] block text-center ${isSelected ? 'text-white/80' : 'text-green-400'}`}>
                                {slot.remaining} disp.
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

export default DeliverySlotSelector
