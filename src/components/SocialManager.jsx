import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { toast } from 'sonner'
import { Loader2, Send, Image, Search, User, MessageCircle, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRealtimeConnection } from '../hooks/useRealtimeConnection'

const SocialManager = () => {
    const [conversations, setConversations] = useState([])
    const [selectedChat, setSelectedChat] = useState(null) // conversation_id (sender_id)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const messagesEndRef = useRef(null)

    // 1. Fetch Conversations (Sidebar)
    const fetchConversations = async () => {
        try {
            const { data, error } = await supabase
                .from('social_conversations_view')
                .select('*')
                .order('last_activity', { ascending: false })

            if (error) throw error
            setConversations(data || [])
        } catch (error) {
            console.error('Error fetching conversations:', error)
            toast.error('Error al cargar conversaciones')
        } finally {
            setLoading(false)
        }
    }

    // 2. Fetch Messages for Selected Chat
    const fetchMessages = async (chatId) => {
        setLoadingMessages(true)
        try {
            const { data, error } = await supabase
                .from('social_messages')
                .select('*')
                .or(`sender_id.eq.${chatId},recipient_id.eq.${chatId}`)
                .order('created_at', { ascending: true })

            if (error) throw error
            setMessages(data || [])
        } catch (error) {
            console.error('Error fetching messages:', error)
            toast.error('Error al cargar mensajes')
        } finally {
            setLoadingMessages(false)
            scrollToBottom()
        }
    }

    // 3. Realtime Subscription (Global for new msgs)
    useEffect(() => {
        fetchConversations()

        const subscription = supabase
            .channel('social_messages_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'social_messages' },
                (payload) => {
                    const newMsg = payload.new

                    // Update Sidebar (Re-fetch or optimistic update - simpliest is re-fetch for view)
                    fetchConversations()

                    // If chat open, add to list
                    if (selectedChat && (newMsg.sender_id === selectedChat || newMsg.recipient_id === selectedChat)) {
                        setMessages(prev => [...prev, newMsg])
                        scrollToBottom()
                    } else {
                        toast.info('Nuevo mensaje recibido 💬')
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [selectedChat])

    // Effect: Load messages when chat selected
    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat)
        }
    }, [selectedChat])

    // Auto-Refresh
    useRealtimeConnection(() => {
        // Always refresh sidebar
        fetchConversations()
        // If chat open, refresh msg
        if (selectedChat) fetchMessages(selectedChat)
    }, [selectedChat], 'SocialManager', 30000)

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedChat) return

        setSending(true)
        try {
            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('social-send-message', {
                body: {
                    recipient_id: selectedChat,
                    message_text: newMessage
                }
            })

            if (error) throw error
            if (data?.error) throw new Error(data.error)

            // Message is inserted via backend, Realtime will catch it and update UI
            setNewMessage('')
            // Optimistic update optional, but backend insert is fast enough usually

        } catch (error) {
            console.error('Error sending message:', error)
            toast.error('Error al enviar mensaje: ' + error.message)
        } finally {
            setSending(false)
        }
    }

    // Determine User Display Name (Placeholder, as we only have ID unless we fetch profile from Graph API)
    const getDisplayName = (id) => `Usuario Instagram (${id.slice(0, 5)}...)`

    const filteredConversations = conversations.filter(c =>
        c.conversation_id.includes(searchTerm) || c.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-[var(--color-primary)]" /></div>

    return (
        <div className="flex h-[calc(100vh-100px)] bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            {/* LEFT SIDEBAR: CONVERSATIONS */}
            <div className="w-1/3 border-r border-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5 bg-black/20">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-[var(--color-secondary)]" />
                        Mensajes
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--color-background)] rounded-xl py-2 pl-9 pr-4 text-sm text-white border border-white/5 focus:outline-none focus:border-[var(--color-primary)]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No hay conversaciones</div>
                    ) : (
                        filteredConversations.map((chat) => (
                            <div
                                key={chat.conversation_id}
                                onClick={() => setSelectedChat(chat.conversation_id)}
                                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedChat === chat.conversation_id ? 'bg-[var(--color-primary)]/10 border-l-4 border-l-[var(--color-primary)]' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-sm text-white truncate w-32">
                                        {getDisplayName(chat.conversation_id)}
                                    </span>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {format(new Date(chat.last_activity), 'HH:mm', { locale: es })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 truncate pr-2">
                                    {chat.last_message || 'Imagen adjunta'}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT MAIN: CHAT WINDOW */}
            <div className="flex-1 flex flex-col bg-[var(--color-background)]">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[var(--color-surface)] shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white leading-none mb-1">{getDisplayName(selectedChat)}</h3>
                                    <span className="text-xs text-brand-instagram flex items-center gap-1">
                                        • Instagram
                                    </span>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/chat-bg-pattern.png')] bg-repeat bg-opacity-5">
                            {loadingMessages ? (
                                <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-gray-500" /></div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-10 text-sm">Inicio de la conversación</div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.direction === 'outgoing'
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm ${isMe
                                                ? 'bg-[var(--color-primary)] text-white rounded-tr-none'
                                                : 'bg-[var(--color-surface)] border border-white/10 text-gray-200 rounded-tl-none'
                                                }`}>
                                                {msg.message_text && <p>{msg.message_text}</p>}
                                                {msg.media_url && (
                                                    <img src={msg.media_url} className="mt-2 rounded-lg max-w-full" alt="Adjunto" />
                                                )}
                                                <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-gray-500'}`}>
                                                    {format(new Date(msg.created_at), 'HH:mm')}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[var(--color-surface)] border-t border-white/5">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                                    <Image className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-[var(--color-background)] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-[var(--color-primary)] p-3 rounded-xl text-white shadow-lg hover:bg-[var(--color-primary)]/80 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-10 h-10 opacity-50" />
                        </div>
                        <p>Selecciona una conversación para comenzar</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SocialManager
