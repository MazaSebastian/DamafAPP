import { useState, useEffect } from 'react'
import { X, MapPin, Phone, Mail, Star, Calendar, ShoppingBag, DollarSign, Edit2, Save, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import { toast } from 'sonner'
import AddressAutocomplete from '../AddressAutocomplete'

const CustomerDetailsModal = ({ isOpen, onClose, customer, onCustomerUpdated }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (customer) {
            setFormData({
                first_name: customer.first_name || '',
                last_name: customer.last_name || '',
                phone: customer.phone || '',
                address: customer.address || '',
                floor: customer.floor || '',
                department: customer.department || '',
                postal_code: customer.postal_code || ''
            })
            setIsEditing(false)
        }
    }, [customer, isOpen])

    if (!isOpen || !customer) return null

    const handleSave = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    full_name: `${formData.first_name} ${formData.last_name}`.trim(),
                    phone: formData.phone,
                    address: formData.address,
                    floor: formData.floor,
                    department: formData.department,
                    postal_code: formData.postal_code
                })
                .eq('id', customer.id)

            if (error) throw error

            toast.success('Cliente actualizado correctamente')
            setIsEditing(false)
            if (onCustomerUpdated) onCustomerUpdated()
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Error al actualizar cliente')
        } finally {
            setSaving(false)
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[var(--color-surface)] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-start bg-[var(--color-background)]">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                                {customer.first_name?.[0]?.toUpperCase() || customer.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <div className="flex gap-2 mb-1">
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            placeholder="Nombre"
                                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white w-full"
                                        />
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                            placeholder="Apellido"
                                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white w-full"
                                        />
                                    </div>
                                ) : (
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 truncate">
                                        {customer.first_name ? `${customer.first_name} ${customer.last_name || ''}` : (customer.full_name || 'Sin nombre')}
                                        {customer.customer_id && (
                                            <span className="text-sm px-2 py-0.5 bg-white/10 rounded text-[var(--color-text-muted)] font-mono shrink-0">
                                                #{customer.customer_id}
                                            </span>
                                        )}
                                    </h2>
                                )}
                                <p className="text-[var(--color-text-muted)] text-sm">Registrado: {new Date(customer.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
                                        title="Guardar"
                                    >
                                        <Save size={20} />
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                        title="Cancelar"
                                    >
                                        <X size={20} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 size={20} />
                                </button>
                            )}
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-[var(--color-background)] p-4 rounded-xl border border-white/5 text-center">
                                <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                                <div className="text-2xl font-bold text-white">{customer.orderCount}</div>
                                <div className="text-xs text-[var(--color-text-muted)] uppercase">Pedidos</div>
                            </div>
                            <div className="bg-[var(--color-background)] p-4 rounded-xl border border-white/5 text-center">
                                <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
                                <div className="text-2xl font-bold text-white">${customer.totalSpent?.toLocaleString()}</div>
                                <div className="text-xs text-[var(--color-text-muted)] uppercase">Gastado</div>
                            </div>
                            <div className="bg-[var(--color-background)] p-4 rounded-xl border border-white/5 text-center">
                                <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                                <div className="text-2xl font-bold text-white">{customer.stars || 0}</div>
                                <div className="text-xs text-[var(--color-text-muted)] uppercase">Puntos</div>
                            </div>
                        </div>

                        {/* Contact & Address */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Contacto</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-300 h-9">
                                        <Mail className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
                                        <span className="truncate" title={customer.email}>{customer.email || 'No registrado'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300 h-9">
                                        <Phone className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="Teléfono"
                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white w-full"
                                            />
                                        ) : (
                                            <span>{customer.phone || 'No registrado'}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Dirección</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 text-gray-300">
                                        <MapPin className="w-5 h-5 text-[var(--color-text-muted)] mt-2 shrink-0" />
                                        <div className="w-full space-y-2">
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <AddressAutocomplete
                                                        placeholder="🔍 Buscar dirección en mapa..."
                                                        onSelect={(addr) => setFormData({ ...formData, address: addr })}
                                                        className="w-full bg-blue-500/10 border border-blue-500/20 rounded px-2 py-2 text-white placeholder-blue-300/50 text-sm focus:outline-none focus:border-blue-500"
                                                    />

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold ml-1">Calle y Altura</label>
                                                        <input
                                                            type="text"
                                                            value={formData.address}
                                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                            placeholder="Ej: Av. Libertador 1234"
                                                            className="bg-white/5 border border-white/10 rounded px-2 py-2 text-white w-full text-sm focus:border-[var(--color-primary)] outline-none"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold ml-1">Piso</label>
                                                            <input
                                                                type="text"
                                                                value={formData.floor}
                                                                onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-2 text-white w-full text-sm text-center focus:border-[var(--color-primary)] outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold ml-1">Depto</label>
                                                            <input
                                                                type="text"
                                                                value={formData.department}
                                                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-2 text-white w-full text-sm text-center focus:border-[var(--color-primary)] outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold ml-1">CP</label>
                                                            <input
                                                                type="text"
                                                                value={formData.postal_code}
                                                                onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-2 text-white w-full text-sm text-center focus:border-[var(--color-primary)] outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="font-medium text-white">{customer.address || 'Sin dirección principal'}</p>
                                                    {(customer.floor || customer.department) && (
                                                        <p className="text-sm text-[var(--color-text-muted)]">
                                                            Piso: {customer.floor || '-'} • Depto: {customer.department || '-'}
                                                        </p>
                                                    )}
                                                    {customer.postal_code && (
                                                        <p className="text-sm text-[var(--color-text-muted)]">
                                                            CP: {customer.postal_code}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default CustomerDetailsModal
