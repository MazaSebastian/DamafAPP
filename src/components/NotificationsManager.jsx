import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Bell, Send, Users, User, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

const NotificationsManager = () => {
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [targetType, setTargetType] = useState('all_users') // 'all_users', 'specific_user', 'driver'
    const [targetId, setTargetId] = useState('')
    const [targetUser, setTargetUser] = useState(null) // { full_name, email }
    const [isCheckingUser, setIsCheckingUser] = useState(false)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(null) // { sent: 0, total: 0 }

    // Live User Lookup
    useEffect(() => {
        const fetchUser = async () => {
            // Allow shorter inputs for Numeric IDs (e.g. "12")
            if (targetType !== 'specific_user' || !targetId) {
                setTargetUser(null)
                return
            }

            // Simple heuristic: If it looks like a number, treat as customer_id
            const isNumericId = /^\d+$/.test(targetId);

            // If it's a UUID, it needs to be long-ish. If numeric, can be short.
            if (!isNumericId && targetId.length < 20) {
                setTargetUser(null)
                return
            }

            setIsCheckingUser(true)

            let query = supabase.from('profiles').select('id, full_name, email, fcm_token').single();

            if (isNumericId) {
                query = query.eq('customer_id', parseInt(targetId));
            } else {
                query = query.eq('id', targetId);
            }

            const { data, error } = await query;

            if (data && !error) {
                setTargetUser(data)
            } else {
                setTargetUser(null)
            }
            setIsCheckingUser(false)
        }

        const timeout = setTimeout(fetchUser, 500) // Debounce
        return () => clearTimeout(timeout)
    }, [targetId, targetType])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!title.trim() || !body.trim()) return toast.warning('Completa título y mensaje')

        setLoading(true)
        setProgress(null)

        try {
            let tokens = []

            // A. Fetch Targets
            if (targetType === 'all_users') {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, fcm_token')
                    .not('fcm_token', 'is', null)

                if (error) throw error
                tokens = data.map(u => ({ token: u.fcm_token, userId: u.id }))
            } else if (targetType === 'drivers') {
                const { data, error } = await supabase
                    .from('drivers')
                    .select('id, fcm_token')
                    .not('fcm_token', 'is', null)
                    .eq('status', 'active')

                if (error) throw error
                tokens = data.map(d => ({ token: d.fcm_token, userId: d.id }))
            } else if (targetType === 'specific_user') {
                // Use the resolved User from the lookup effect
                if (!targetUser) return toast.error('Debes seleccionar un usuario válido');

                // Use targetUser.id (UUID) and targetUser.fcm_token
                if (targetUser.fcm_token) {
                    tokens = [{ token: targetUser.fcm_token, userId: targetUser.id }];
                } else {
                    return toast.error('El usuario seleccionado no tiene notificaciones activas');
                }
            }

            if (tokens.length === 0) {
                toast.info('No hay destinatarios válidos con notificaciones activas.')
                setLoading(false)
                return
            }

            toast.info(`Iniciando envío a ${tokens.length} destinatarios...`)
            setProgress({ sent: 0, total: tokens.length })

            // B. Send in Batches (client-side iteration for now)
            let successCount = 0

            // Loop through tokens
            for (const recipient of tokens) {
                const { error } = await supabase.functions.invoke('push', {
                    body: {
                        token: recipient.token, // Send direct token to EF
                        title: title,
                        body: body,
                        openUrl: '/' // Optional: landing page
                    }
                })

                if (!error) {
                    successCount++
                } else {
                    console.error('Failed to send to', recipient.userId, error)
                }

                // Update Progress
                setProgress(prev => ({ ...prev, sent: prev.sent + 1 }))
            }

            toast.success(`Enviado correctamente a ${successCount} de ${tokens.length} dispositivos.`)

        } catch (error) {
            console.error(error)
            toast.error('Error al enviar: ' + error.message)
        } finally {
            setLoading(false)
            setProgress(null)
            // Clear form? maybe not in case of resend
        }
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Bell className="w-8 h-8 text-[var(--color-secondary)]" />
                    Notificaciones Push
                </h1>
                <p className="text-[var(--color-text-muted)] mt-2">
                    Envía avisos, promociones y novedades directamente a los dispositivos de tus clientes.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSend} className="bg-[var(--color-surface)] p-6 rounded-2xl border border-white/5 space-y-6">

                        {/* Target Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Destinatarios</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTargetType('all_users')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${targetType === 'all_users' ? 'bg-[var(--color-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <Users className="w-5 h-5" />
                                    <span className="text-xs font-bold">Todos (Usuarios)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetType('drivers')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${targetType === 'drivers' ? 'bg-[var(--color-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <Users className="w-5 h-5" />
                                    <span className="text-xs font-bold">Choferes (Activos)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetType('specific_user')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${targetType === 'specific_user' ? 'bg-[var(--color-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <User className="w-5 h-5" />
                                    <span className="text-xs font-bold">Usuario ID</span>
                                </button>
                            </div>

                            {targetType === 'specific_user' && (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={targetId}
                                        onChange={e => setTargetId(e.target.value.trim())}
                                        placeholder="Ingresa ID numérico (Ej: 12) o UUID..."
                                        className="w-full bg-black/20 p-3 rounded-xl text-white text-sm border border-white/10 focus:outline-none focus:border-[var(--color-primary)] font-mono"
                                    />

                                    {/* User Lookup Status */}
                                    {isCheckingUser ? (
                                        <div className="flex items-center gap-2 text-xs text-white/50 animate-pulse">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Buscando usuario...
                                        </div>
                                    ) : targetUser ? (
                                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center justify-between animate-in slide-in-from-top-1">
                                            <div>
                                                <p className="text-white font-bold text-sm">{targetUser.full_name || 'Sin Nombre'}</p>
                                                <p className="text-xs text-green-300">{targetUser.email}</p>
                                            </div>
                                            {targetUser.fcm_token ? (
                                                <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">Activo ✅</span>
                                            ) : (
                                                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">Sin Push ❌</span>
                                            )}
                                        </div>
                                    ) : targetId.length > 0 ? (
                                        <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg text-xs text-red-300 flex items-center gap-2">
                                            <AlertTriangle className="w-3 h-3" /> Usuario no encontrado
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        <hr className="border-white/5" />

                        {/* Content */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">Título</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ej: ¡2x1 en Hamburguesas! 🍔"
                                    className="w-full bg-black/20 p-4 rounded-xl text-white font-bold border border-white/10 focus:outline-none focus:border-[var(--color-primary)] text-lg placeholder-white/20"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">Mensaje</label>
                                <textarea
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                    rows={4}
                                    placeholder="Ej: Solo por hoy, aprovecha nuestra promo exclusiva..."
                                    className="w-full bg-black/20 p-4 rounded-xl text-white border border-white/10 focus:outline-none focus:border-[var(--color-primary)] text-sm leading-relaxed placeholder-white/20 resize-none"
                                />
                            </div>
                        </div>

                        {/* Action */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--color-secondary)] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {progress ? `Enviando (${progress.sent}/${progress.total})...` : 'Enviando...'}
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" /> Enviar Notificación
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

                {/* Preview / Tips */}
                <div className="space-y-6">
                    <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" /> Tips
                        </h3>
                        <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
                            <li className="flex gap-2">
                                <span className="text-[var(--color-secondary)]">•</span>
                                Usa emojis para aumentar la tasa de apertura ??
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[var(--color-secondary)]">•</span>
                                Sé breve y directo. Tienes pocos segundos de atención.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[var(--color-secondary)]">•</span>
                                Evita enviar demasiadas notificaciones seguidas (Spam).
                            </li>
                        </ul>
                    </div>

                    <div className="bg-yellow-500/10 p-6 rounded-2xl border border-yellow-500/20">
                        <h3 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Importante
                        </h3>
                        <p className="text-xs text-yellow-200/80 leading-relaxed">
                            Las notificaciones masivas se envían secuencialmente para asegurar la entrega. Por favor, no cierres esta pestaña hasta que el proceso termine.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationsManager
