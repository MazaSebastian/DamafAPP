import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import KDSTicket from '../components/kds/KDSTicket'
import useSound from 'use-sound' // Optional: Install if we want sounds, generic notification for now

const KDSPage = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    // Sound notification function
    const playNewOrderSound = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Pleasant notification sound (3 ascending tones)
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15) // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3) // G5

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
    }

    useEffect(() => {
        fetchKDSOrders()

        const channel = supabase
            .channel('kds_orders')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: 'status=in.(cooking)'
            }, (payload) => {
                // Play sound when new order arrives to kitchen or status changes to cooking
                if (payload.eventType === 'INSERT' || (payload.eventType === 'UPDATE' && payload.new.status === 'cooking')) {
                    playNewOrderSound()
                    toast.success('🔥 Nueva comanda en cocina!', {
                        description: `Pedido #${payload.new.id.slice(0, 4)}`
                    })
                }
                fetchKDSOrders()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchKDSOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (name) 
                ),
                profiles:user_id (full_name)
            `)
            .in('status', ['cooking'])
            .order('created_at', { ascending: true }) // Oldest first (FIFO)

        if (data) setOrders(data)
        setLoading(false)
    }

    const handleAdvanceStatus = async (orderId, nextStatus) => {
        // Optimistic UI update could go here

        const { error } = await supabase
            .from('orders')
            .update({ status: nextStatus })
            .eq('id', orderId)

        if (error) {
            toast.error('Error al actualizar estado')
        } else {
            toast.success(`Pedido #${orderId.slice(0, 4)} movido a ${nextStatus}`)
            fetchKDSOrders()
        }
    }

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><Loader2 className="animate-spin w-10 h-10 text-orange-500" /></div>

    return (
        <div className="h-screen bg-[var(--color-background)] text-white flex flex-col overflow-hidden font-[var(--font-sans)]">
            {/* Top Bar */}
            <div className="bg-[var(--color-surface)]/90 backdrop-blur-xl px-6 py-5 flex justify-between items-center border-b border-white/5 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="p-2.5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-white/10 hover:scale-105">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-black uppercase tracking-wider text-white">
                        KDS <span className="text-[var(--color-secondary)]">Cocina</span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <div className="px-5 py-2.5 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-400 font-bold text-sm shadow-[0_0_20px_rgba(234,179,8,0.05)] hover:bg-yellow-500/15 transition-all">
                        Pendientes: {orders.filter(o => o.status === 'pending').length}
                    </div>
                    <div className="px-5 py-2.5 bg-[var(--color-secondary)]/10 rounded-2xl border border-[var(--color-secondary)]/20 text-[var(--color-secondary)] font-bold text-sm shadow-[0_0_20px_rgba(214,67,34,0.05)] hover:bg-[var(--color-secondary)]/15 transition-all">
                        En Marcha: {orders.filter(o => o.status === 'cooking').length}
                    </div>
                </div>
            </div>

            {/* Horizontal Scroll Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 kds-scrollbar">
                <div className="flex gap-6 h-full pb-4 items-start snap-x snap-mandatory">
                    {orders.length > 0 ? (
                        orders.map(order => (
                            <KDSTicket
                                key={order.id}
                                order={order}
                                onAdvanceStatus={handleAdvanceStatus}
                            />
                        ))
                    ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col text-[var(--color-text-muted)]">
                            <span className="text-7xl mb-4 opacity-40">😌</span>
                            <span className="text-2xl font-bold uppercase opacity-60">Todo al día</span>
                            <p className="text-sm opacity-40 mt-2">Esperando nuevas comandas...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default KDSPage
