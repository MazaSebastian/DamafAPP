import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Loader2, Save, Home } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

// ... existing code ...

{/* Header */ }
            <header className="p-4 flex items-center sticky top-0 bg-[var(--color-background)]/90 backdrop-blur-md z-40 border-b border-white/5">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 text-center pr-2">
                    <img src="/logo-damaf.png" alt="Damaf Logo" className="h-10 w-auto mx-auto drop-shadow-md" />
                </div>
                <Link to="/" className="p-2 -mr-2 text-white hover:bg-white/10 rounded-full transition-colors">
                    <Home className="w-6 h-6 text-[var(--color-primary)]" />
                </Link>
            </header>

            <div className="text-center mt-2 mb-6">
                <h1 className="text-2xl font-bold">Cuenta</h1>
            </div>

            <main className="px-6 max-w-md mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[var(--color-secondary)]" />
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        {/* Email (Read Only) */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--color-text-muted)] ml-1">Tu correo electrónico *</label>
                            <input
                                type="text"
                                value={user.email}
                                disabled
                                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed focus:outline-none"
                            />
                        </div>

                        {/* Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--color-text-muted)] ml-1">Nombre *</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all"
                                placeholder="Nombre completo"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--color-text-muted)] ml-1">Número de teléfono</label>
                            <div className="flex gap-2">
                                <select
                                    value={phoneData.countryCode}
                                    onChange={(e) => setPhoneData({ ...phoneData, countryCode: e.target.value })}
                                    className="w-[100px] bg-[var(--color-surface)] border border-white/10 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] text-sm appearance-none cursor-pointer"
                                >
                                    {countryCodes.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.flag} {c.code}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    value={phoneData.number}
                                    onChange={(e) => setPhoneData({ ...phoneData, number: e.target.value })}
                                    className="flex-1 bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all"
                                    placeholder="Número sin 0 ni 15"
                                />
                            </div>
                        </div>

                        {/* Birth Date (Read Only) */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--color-text-muted)] ml-1">Fecha de nacimiento</label>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        value={dob.year}
                                        disabled
                                        placeholder="Año"
                                        className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-3 text-center text-white/50 cursor-not-allowed"
                                    />
                                    <span className="text-[10px] text-gray-500 pl-1">AAAA</span>
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        value={dob.month}
                                        disabled
                                        placeholder="Mes"
                                        className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-3 text-center text-white/50 cursor-not-allowed"
                                    />
                                    <span className="text-[10px] text-gray-500 pl-1">MM</span>
                                </div>
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        value={dob.day}
                                        disabled
                                        placeholder="Dia"
                                        className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-3 text-center text-white/50 cursor-not-allowed"
                                    />
                                    <span className="text-[10px] text-gray-500 pl-1">DD</span>
                                </div>
                            </div>
                        </div>

                        {/* Zip Code */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--color-text-muted)] ml-1">Código Postal</label>
                            <input
                                type="text"
                                value={formData.zip_code}
                                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all"
                                placeholder="1234"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-[var(--color-secondary)] text-white font-black text-lg py-3 rounded-full shadow-lg hover:bg-orange-600 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {saving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Actualizar'}
                        </button>
                    </form>
                )}

                {/* Footer Links */}
                <div className="mt-8 space-y-4 border-t border-white/5 pt-4">
                    <Link to="/privacy" className="w-full flex justify-between items-center text-sm font-bold text-white/80 hover:text-white py-2">
                        Política de privacidad <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                    <Link to="/terms" className="w-full flex justify-between items-center text-sm font-bold text-white/80 hover:text-white py-2">
                        Términos de servicio <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                </div>
            </main>
        </div >
    )
}

export default ProfilePage
