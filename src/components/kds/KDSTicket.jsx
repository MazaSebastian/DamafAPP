import { useState, useEffect } from 'react'
import { Clock, Check, MoreVertical } from 'lucide-react'
import { formatDistanceToNow, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'

const KDSTicket = ({ order, onAdvanceStatus }) => {
    const [elapsedMinutes, setElapsedMinutes] = useState(0)
    const [checkedItems, setCheckedItems] = useState({})

    useEffect(() => {
        // Initial calc
        updateTimer()

        // Interval
        const interval = setInterval(updateTimer, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [order.created_at])

    const updateTimer = () => {
        setElapsedMinutes(differenceInMinutes(new Date(), new Date(order.created_at)))
    }

    const toggleItem = (itemId) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }))
    }

    const allItemsChecked = order.order_items?.every(item => checkedItems[item.id])

    // Timer Colors
    let timerColor = 'text-green-400'
    let borderColor = 'border-green-500/30'
    let bgPulse = ''

    if (elapsedMinutes >= 10) {
        timerColor = 'text-yellow-400'
        borderColor = 'border-yellow-500/30'
    }
    if (elapsedMinutes >= 20) {
        timerColor = 'text-red-500'
        borderColor = 'border-red-500'
        bgPulse = 'animate-pulse'
    }

    return (
        <div className={`bg-[var(--color-surface)] rounded-2xl border-l-4 ${borderColor} ${elapsedMinutes >= 20 ? 'shadow-[0_0_25px_rgba(239,68,68,0.25)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.15)]'} flex flex-col h-full min-w-[320px] max-w-[360px] flex-shrink-0 snap-start transition-all duration-300 hover:scale-[1.02]`}>
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-2xl font-black text-white">{order.id.slice(0, 4)}</span>
                        {order.status === 'cooking' && (
                            <span className="bg-orange-500/15 text-orange-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-orange-500/20 animate-pulse shadow-[0_0_10px_rgba(251,146,60,0.1)]">
                                Cocinando
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">
                        {order.profiles?.full_name || 'Invitado'}
                    </div>
                </div>
                <div className={`font-mono text-xl font-bold flex items-center gap-1.5 ${timerColor}`}>
                    <Clock className="w-4 h-4" />
                    {elapsedMinutes}m
                </div>
            </div>

            {/* Items */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5 kds-scrollbar">
                {order.order_items?.map(item => (
                    <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${checkedItems[item.id]
                            ? 'bg-green-500/10 border-green-500/30 opacity-60 scale-[0.98]'
                            : 'bg-[var(--color-background)] border-white/5 hover:border-white/20 hover:bg-[var(--color-background)]/80'
                            }`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold text-base leading-tight ${checkedItems[item.id] ? 'line-through text-white/40' : 'text-white'}`}>
                                1x {item.products.name}
                            </span>
                            {checkedItems[item.id] && <Check className="w-5 h-5 text-green-400" />}
                        </div>
                        {/* Variations */}
                        {item.modifiers?.length > 0 && (
                            <div className="text-xs text-[var(--color-text-muted)] pl-2.5 border-l-2 border-white/10 mt-1.5 space-y-0.5">
                                {item.modifiers.map((m, idx) => (
                                    <div key={idx}>• {m.name}</div>
                                ))}
                            </div>
                        )}
                        {item.side_info && <div className="text-xs text-yellow-400/90 font-medium pl-2.5 mt-1.5 flex items-center gap-1">🍟 {item.side_info.name}</div>}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                {order.status === 'pending' ? (
                    <button
                        onClick={() => onAdvanceStatus(order.id, 'cooking')}
                        className="w-full py-4 rounded-2xl bg-[var(--color-secondary)] text-white font-black text-base uppercase tracking-wider hover:bg-orange-600 transition-all duration-200 shadow-[0_4px_15px_rgba(214,67,34,0.3)] hover:shadow-[0_6px_20px_rgba(214,67,34,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        🔥 EMPEZAR
                    </button>
                ) : (
                    <button
                        onClick={() => onAdvanceStatus(order.id, 'packaging')}
                        className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${allItemsChecked
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_15px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.4)] hover:scale-[1.02]'
                            : 'bg-white/10 text-white/50 hover:bg-white/15 cursor-not-allowed'
                            } active:scale-[0.98]`}
                        disabled={!allItemsChecked}
                    >
                        {allItemsChecked ? '✓ DESPACHAR' : 'MARCAR LISTO'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default KDSTicket
