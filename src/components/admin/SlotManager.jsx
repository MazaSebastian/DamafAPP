import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { Loader2, Plus, Trash2, Edit2, Save, X, Clock, ShoppingBag, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { format, parse, addMinutes } from 'date-fns'

const SlotManager = () => {
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [isCreating, setIsCreating] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        start_time: '20:30',
        max_orders: 5,
        is_delivery: true,
        is_takeaway: true
    })

    useEffect(() => {
        fetchSlots()
    }, [])

    const fetchSlots = async () => {
        try {
            const { data, error } = await supabase
                .from('production_slots')
                .select('*')
                .order('start_time', { ascending: true })

            if (error) throw error
            setSlots(data)
        } catch (error) {
            console.error('Error fetching slots:', error)
            toast.error('Error al cargar horarios')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            if (!formData.start_time) return toast.error('Ingresa una hora')

            const payload = {
                start_time: formData.start_time,
                max_orders: parseInt(formData.max_orders),
                is_delivery: formData.is_delivery,
                is_takeaway: formData.is_takeaway
            }

            if (editingId) {
                const { error } = await supabase
                    .from('production_slots')
                    .update(payload)
                    .eq('id', editingId)
                if (error) throw error
                toast.success('Horario actualizado')
            } else {
                const { error } = await supabase
                    .from('production_slots')
                    .insert([payload])
                if (error) throw error
                toast.success('Horario creado')
            }

            setEditingId(null)
            setIsCreating(false)
            setFormData({ start_time: '20:30', max_orders: 5, is_delivery: true, is_takeaway: true }) // Reset default
            fetchSlots()

        } catch (error) {
            console.error('Error saving slot:', error)
            toast.error('Error al guardar')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este horario?')) return

        try {
            const { error } = await supabase
                .from('production_slots')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Horario eliminado')
            setSlots(slots.filter(s => s.id !== id))
        } catch (error) {
            console.error('Error deleting slot:', error)
            toast.error('Error al eliminar')
        }
    }

    const startEdit = (slot) => {
        setEditingId(slot.id)
        setFormData({
            start_time: slot.start_time.slice(0, 5), // HH:mm
            max_orders: slot.max_orders,
            is_delivery: slot.is_delivery,
            is_takeaway: slot.is_takeaway
        })
        setIsCreating(false)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setIsCreating(false)
        setFormData({ start_time: '20:30', max_orders: 5, is_delivery: true, is_takeaway: true })
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="text-[var(--color-primary)]" />
                    Horarios de Entrega
                </h2>
                {!isCreating && !editingId && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} /> Agregar Horario
                    </button>
                )}
            </div>

            <div className="bg-[var(--color-surface)] rounded-xl border border-white/10 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--color-background)] border-b border-white/10 text-[var(--color-text-muted)] uppercase text-xs tracking-wider">
                                <th className="p-4 font-semibold">Horario</th>
                                <th className="p-4 font-semibold text-center">Capacidad (Pedidos)</th>
                                <th className="p-4 font-semibold text-center">Delivery</th>
                                <th className="p-4 font-semibold text-center">Take Away</th>
                                <th className="p-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {/* Creating Row */}
                            {isCreating && (
                                <tr className="bg-[var(--color-primary)]/10 animate-pulse-soft">
                                    <td className="p-4">
                                        <input
                                            type="time"
                                            value={formData.start_time}
                                            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                            className="bg-[var(--color-background)] border border-white/20 rounded px-2 py-1 text-white focus:border-[var(--color-primary)] outline-none"
                                        />
                                    </td>
                                    <td className="p-4 text-center">
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.max_orders}
                                            onChange={e => setFormData({ ...formData, max_orders: e.target.value })}
                                            className="w-16 bg-[var(--color-background)] border border-white/20 rounded px-2 py-1 text-center text-white focus:border-[var(--color-primary)] outline-none"
                                        />
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => setFormData({ ...formData, is_delivery: !formData.is_delivery })}
                                            className={`p-1.5 rounded-lg transition-colors ${formData.is_delivery ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                        >
                                            <Truck size={18} />
                                        </button>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => setFormData({ ...formData, is_takeaway: !formData.is_takeaway })}
                                            className={`p-1.5 rounded-lg transition-colors ${formData.is_takeaway ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                        >
                                            <ShoppingBag size={18} />
                                        </button>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"><Save size={16} /></button>
                                        <button onClick={cancelEdit} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"><X size={16} /></button>
                                    </td>
                                </tr>
                            )}

                            {/* Data Rows */}
                            {slots.map(slot => (
                                <tr key={slot.id} className="hover:bg-white/5 transition-colors group">
                                    {editingId === slot.id ? (
                                        // Edit Mode Row
                                        <>
                                            <td className="p-4">
                                                <input
                                                    type="time"
                                                    value={formData.start_time}
                                                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                                    className="bg-[var(--color-background)] border border-white/20 rounded px-2 py-1 text-white focus:border-[var(--color-primary)] outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={formData.max_orders}
                                                    onChange={e => setFormData({ ...formData, max_orders: e.target.value })}
                                                    className="w-16 bg-[var(--color-background)] border border-white/20 rounded px-2 py-1 text-center text-white focus:border-[var(--color-primary)] outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => setFormData({ ...formData, is_delivery: !formData.is_delivery })}
                                                    className={`p-1.5 rounded-lg transition-colors ${formData.is_delivery ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                                >
                                                    <Truck size={18} />
                                                </button>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => setFormData({ ...formData, is_takeaway: !formData.is_takeaway })}
                                                    className={`p-1.5 rounded-lg transition-colors ${formData.is_takeaway ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                                >
                                                    <ShoppingBag size={18} />
                                                </button>
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"><Save size={16} /></button>
                                                <button onClick={cancelEdit} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"><X size={16} /></button>
                                            </td>
                                        </>
                                    ) : (
                                        // View Mode Row
                                        <>
                                            <td className="p-4 font-medium text-lg text-white">
                                                {slot.start_time.slice(0, 5)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold">
                                                    {slot.max_orders}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {slot.is_delivery ? (
                                                    <span className="inline-flex items-center gap-1 text-green-400 text-sm font-medium bg-green-500/10 px-2 py-1 rounded">
                                                        <Truck size={14} /> SI
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-400 text-sm font-medium bg-red-500/10 px-2 py-1 rounded">
                                                        <X size={14} /> NO
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {slot.is_takeaway ? (
                                                    <span className="inline-flex items-center gap-1 text-green-400 text-sm font-medium bg-green-500/10 px-2 py-1 rounded">
                                                        <ShoppingBag size={14} /> SI
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-400 text-sm font-medium bg-red-500/10 px-2 py-1 rounded">
                                                        <X size={14} /> NO
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => startEdit(slot)}
                                                        className="p-2 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded transition"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(slot.id)}
                                                        className="p-2 hover:bg-red-500/20 text-red-400 rounded transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}

                            {slots.length === 0 && !isCreating && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-[var(--color-text-muted)] italic">
                                        No hay horarios configurados. Agrega uno para comenzar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default SlotManager
