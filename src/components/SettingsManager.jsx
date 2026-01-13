import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { toast } from 'sonner'
import { Save, Loader2, Settings as SettingsIcon } from 'lucide-react'

const SettingsManager = () => {
    const [settings, setSettings] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('tienda')

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .order('key')

        if (error) {
            console.error('Error fetching settings:', error)
            toast.error('Error al cargar configuración')
        } else {
            setSettings(data || [])
        }
        setLoading(false)
    }

    const handleChange = (key, newValue) => {
        setSettings(prev => prev.map(item =>
            item.key === key ? { ...item, value: newValue } : item
        ))
    }

    const handleSave = async (key, value) => {
        setSaving(true)
        const { error } = await supabase
            .from('app_settings')
            .update({ value, updated_at: new Date() })
            .eq('key', key)

        if (error) {
            console.error('Error saving setting:', error)
            toast.error('Error al guardar')
        } else {
            toast.success('Configuración actualizada')
        }
        setSaving(false)
    }

    const SETTING_LABELS = {
        'delivery_free_range_km': 'Radio de Envío Gratis (KM)',
        'delivery_price_per_km': 'Precio por KM Adicional',
        'stars_exchange_rate': 'Tasa de Canje de Estrellas (Legacy)',
        'store_address': 'Dirección del Local',
        'store_instagram': 'Instagram',
        'store_lat': 'Latitud del Local',
        'store_lng': 'Longitud del Local',
        'store_schedule_text': 'Texto Horarios (Footer)',
        'store_slogan': 'Slogan del Local',
        'store_schedule': 'Configuración de Horarios Automáticos',
        'loyalty_earning_divisor': 'Divisor de Puntos (Monto para 1 estrella)',
        'loyalty_level_green': 'Nivel Green (Estrellas necesarias)',
        'loyalty_level_gold': 'Nivel Gold (Estrellas necesarias)',
        'loyalty_benefits_welcome': 'Beneficios Nivel Welcome (separados por coma)',
        'loyalty_benefits_green': 'Beneficios Nivel Green (separados por coma)',
        'loyalty_benefits_gold': 'Beneficios Nivel Gold (separados por coma)'
    }

    const DAYS_MAP = {
        0: 'Domingo',
        1: 'Lunes',
        2: 'Martes',
        3: 'Miércoles',
        4: 'Jueves',
        5: 'Viernes',
        6: 'Sábado'
    }

    // Helper to group settings
    const getSettingsByCategory = (category) => {
        return settings.filter(s => {
            // Updated to exclude legacy settings if they still exist in DB
            if (category === 'tienda') return s.key.startsWith('store_') && s.key !== 'store_mode' && s.key !== 'store_status'
            if (category === 'delivery') return s.key.startsWith('delivery_')
            if (category === 'loyalty') return s.key.startsWith('loyalty_') || s.key.startsWith('stars_')
            return false
        })
    }

    const tabs = [
        { id: 'tienda', label: 'Tienda' },
        { id: 'delivery', label: 'Delivery' },
        { id: 'loyalty', label: 'Fidelización' }
    ]

    const handleScheduleChange = (scheduleJSON, dayIndex, field, value) => {
        try {
            const schedule = JSON.parse(scheduleJSON)
            if (!schedule[dayIndex]) schedule[dayIndex] = { active: false, start: '19:00', end: '23:00' }

            schedule[dayIndex][field] = value

            return JSON.stringify(schedule)
        } catch (e) {
            console.error("Error updating schedule", e)
            return scheduleJSON
        }
    }

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>

    const renderSettingInput = (setting) => {
        // Schedule Grid UI
        if (setting.key === 'store_schedule') {
            let scheduleData = {}
            try { scheduleData = JSON.parse(setting.value) } catch (e) { }

            return (
                <div className="space-y-2 w-full mt-2">
                    {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => { // Mon to Sun order
                        const dayData = scheduleData[dayIndex] || { active: false, start: '19:00', end: '23:00' }
                        return (
                            <div key={dayIndex} className="flex flex-wrap items-center gap-2 text-sm max-w-2xl bg-black/20 p-2 rounded-lg border border-white/5">
                                <div className="w-24 font-bold text-white/80">{DAYS_MAP[dayIndex]}</div>
                                <label className="flex items-center gap-2 cursor-pointer mr-4">
                                    <input
                                        type="checkbox"
                                        checked={dayData.active}
                                        onChange={(e) => {
                                            const newJSON = handleScheduleChange(setting.value, dayIndex, 'active', e.target.checked)
                                            handleChange(setting.key, newJSON)
                                        }}
                                        className="w-4 h-4 rounded accent-[var(--color-primary)]"
                                    />
                                    <span className={dayData.active ? 'text-green-400' : 'text-gray-500'}>
                                        {dayData.active ? 'Abierto' : 'Cerrado'}
                                    </span>
                                </label>

                                {dayData.active && (
                                    <>
                                        <div className="flex items-center gap-1">
                                            <span className="text-white/50 text-xs">De:</span>
                                            <input
                                                type="time"
                                                value={dayData.start}
                                                onChange={(e) => {
                                                    const newJSON = handleScheduleChange(setting.value, dayIndex, 'start', e.target.value)
                                                    handleChange(setting.key, newJSON)
                                                }}
                                                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs w-24"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-white/50 text-xs">Hasta:</span>
                                            <input
                                                type="time"
                                                value={dayData.end}
                                                onChange={(e) => {
                                                    const newJSON = handleScheduleChange(setting.value, dayIndex, 'end', e.target.value)
                                                    handleChange(setting.key, newJSON)
                                                }}
                                                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs w-24"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                    <div className="mt-2 text-xs text-[var(--color-text-muted)]">* Guarda los cambios para aplicar el nuevo horario.</div>
                    <div className="mt-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                        Nota: Para cerrar por feriado o evento, simplemente destilda el día correspondiente.
                    </div>
                </div>
            )
        }

        // TextArea for long fields
        if (setting.key.includes('benefits') || setting.key.includes('schedule_text')) {
            return (
                <textarea
                    value={setting.value}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    rows={3}
                    className="w-full bg-[var(--color-background)] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
            )
        }

        return (
            <input
                type="text"
                value={setting.value}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                className="w-full bg-[var(--color-background)] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]"
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-white/10">
                    <SettingsIcon className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Configuración del Sistema</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">Ajusta los parámetros globales de la aplicación</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)] rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            <div className="grid gap-6">
                {getSettingsByCategory(activeTab).length > 0 ? (
                    getSettingsByCategory(activeTab).map((setting) => (
                        <div key={setting.key} className="bg-[var(--color-surface)] p-6 rounded-2xl border border-white/5">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white transition-colors">{SETTING_LABELS[setting.key] || setting.key.replace(/_/g, ' ')}</h3>
                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                        {setting.description || 'Sin descripción'}
                                    </p>
                                </div>
                                <div className="flex items-start gap-3 w-full md:w-auto">
                                    <div className="relative w-full md:w-80">
                                        {renderSettingInput(setting)}
                                    </div>
                                    <button
                                        onClick={() => handleSave(setting.key, setting.value)}
                                        disabled={saving}
                                        className="p-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 mt-1"
                                        title="Guardar"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-white/5 text-center">
                        <p className="text-[var(--color-text-muted)]">No hay configuraciones disponibles en esta categoría.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SettingsManager
