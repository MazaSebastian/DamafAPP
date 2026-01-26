import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { X, Save, Loader2, User, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'

import AddressAutocomplete from '../AddressAutocomplete'

const CreateCustomerModal = ({ isOpen, onClose, onCustomerCreated }) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        floor: '',
        department: '',
        postal_code: ''
    })

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validation
            if (!formData.address) {
                toast.error('La dirección es obligatoria')
                setLoading(false)
                return
            }

            // Insert into profiles
            const { error } = await supabase
                .from('profiles')
                .insert([
                    {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        floor: formData.floor,
                        department: formData.department,
                        postal_code: formData.postal_code
                    }
                ])

            if (error) throw error

            toast.success('Cliente creado exitosamente')
            if (onCustomerCreated) onCustomerCreated()
            onClose()
            setFormData({ first_name: '', last_name: '', email: '', phone: '', address: '', floor: '', department: '', postal_code: '' })

        } catch (error) {
            console.error('Error creating customer:', error)
            toast.error('Error al crear cliente: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-lg bg-[var(--color-surface)] border border-white/10 rounded-2xl shadow-2xl my-8">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Nuevo Cliente Manual</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Nombre *</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#e00201] transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#e00201]/50 focus:ring-1 focus:ring-[#e00201]/50 transition-all"
                                    placeholder="Juan"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Apellido *</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#e00201] transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#e00201]/50 focus:ring-1 focus:ring-[#e00201]/50 transition-all"
                                    placeholder="Pérez"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Email *</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#e00201] transition-colors" size={16} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#e00201]/50 focus:ring-1 focus:ring-[#e00201]/50 transition-all"
                                    placeholder="juan@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Teléfono *</label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#e00201] transition-colors" size={16} />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#e00201]/50 focus:ring-1 focus:ring-[#e00201]/50 transition-all"
                                    placeholder="+54 11 ..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Dirección *</label>
                        <AddressAutocomplete
                            onSelect={(address) => setFormData({ ...formData, address })}
                            defaultValue={formData.address}
                            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#e00201]/50 focus:ring-1 focus:ring-[#e00201]/50 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Piso</label>
                            <input
                                type="text"
                                value={formData.floor}
                                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#e00201]/50 transition-all"
                                placeholder="PB"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Depto</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#e00201]/50 transition-all"
                                placeholder="A"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">CP</label>
                            <input
                                type="text"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#e00201]/50 transition-all"
                                placeholder="1234"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-[#e00201] hover:bg-[#c00201] text-white rounded-xl transition-all shadow-lg shadow-[#e00201]/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Crear Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateCustomerModal
