import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Wifi, WifiOff, Loader2, Database } from 'lucide-react'

const DebugConnection = () => {
    const [status, setStatus] = useState('checking') // checking, connected, error, paused
    const [latency, setLatency] = useState(null)
    const [details, setDetails] = useState('')

    useEffect(() => {
        const checkConnection = async () => {
            const start = Date.now()
            try {
                // Try to fetch a single row from profiles (lightweight)
                // We use head: true to avoid fetching data, just check permissions/connection
                // But wait, if RLS is on, head might fail?
                // Let's try to get public info or just standard health check if possible.
                // We'll stick to a table we know exists: 'news_events' (usually public).

                const { error } = await supabase
                    .from('news_events')
                    .select('id', { count: 'exact', head: true })
                    .limit(1)

                const end = Date.now()
                setLatency(end - start)

                if (error) {
                    console.error('Debug Connection Error:', error)
                    setStatus('error')
                    setDetails(error.message || error.code || 'Unknown error')
                } else {
                    setStatus('connected')
                }
            } catch (err) {
                console.error('Debug Connection Exception:', err)
                setStatus('error')
                setDetails(err.message)
            }
        }

        checkConnection()

        // Poll every 10 seconds? No, just once for now.
    }, [])

    // if (status === 'connected') return null // Commented out to force visibility for now

    return (
        <div className="fixed bottom-24 right-4 z-50 bg-black/80 backdrop-blur-md text-white p-3 rounded-lg shadow-lg border border-white/10 text-xs max-w-xs transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
                {status === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />}
                {status === 'connected' && <Wifi className="w-4 h-4 text-green-400" />}
                {status === 'error' && <WifiOff className="w-4 h-4 text-red-400" />}
                <span className="font-bold">
                    {status === 'checking' && 'Verificando Conexión...'}
                    {status === 'connected' && 'Conectado'}
                    {status === 'error' && 'Error de Conexión'}
                </span>
            </div>

            {status === 'connected' && latency && (
                <div className="text-gray-400 pl-6">
                    Ping: {latency}ms
                </div>
            )}

            {status === 'error' && (
                <div className="text-red-300 pl-6 break-words">
                    {details}
                    <div className="mt-2 text-[10px] text-gray-400">
                        Intenta ejecutar el script SQL_DISABLE_RLS_ALL.sql en Supabase.
                    </div>
                </div>
            )}
        </div>
    )
}

export default DebugConnection
