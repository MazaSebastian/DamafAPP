import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { toast } from 'sonner'
import { Save, Loader2, Settings as SettingsIcon } from 'lucide-react'

const SettingsManager = () => {
    const [settings, setSettings] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

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
            // Ensure default exists if table empty (optional fallback UI)
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

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>

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

            <div className="grid gap-6">
                {settings.length > 0 ? (
                    settings.map((setting) => (
                        <div key={setting.key} className="bg-[var(--color-surface)] p-6 rounded-2xl border border-white/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white capitalize">{setting.key.replace(/_/g, ' ')}</h3>
                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                        {setting.description || 'Sin descripción'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="relative w-full md:w-48">
                                        <input
                                            type="text"
                                            value={setting.value}
                                            onChange={(e) => handleChange(setting.key, e.target.value)}
                                            className="w-full bg-[var(--color-background)] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleSave(setting.key, setting.value)}
                                        disabled={saving}
                                        className="p-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
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
                        <p className="text-[var(--color-text-muted)]">No hay configuraciones disponibles. Asegúrate de ejecutar el script SQL.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SettingsManager
