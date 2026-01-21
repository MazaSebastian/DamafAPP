import { useState } from 'react'
import { X, Search, ShoppingBag, Receipt, Calendar, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const PeriodOrdersModal = ({ isOpen, onClose, orders, dateRangeLabel }) => {
    const [searchTerm, setSearchTerm] = useState('')

    if (!isOpen) return null

    const getStatusColor = (status) => {
        const colors = {
            pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
            preparing: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
            ready: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
            sent: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
            completed: 'text-green-400 bg-green-400/10 border-green-400/20',
            cancelled: 'text-red-400 bg-red-400/10 border-red-400/20'
        }
        return colors[status] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Receipt className="text-orange-400" />
                            Detalle de Pedidos
                        </h2>
                        <p className="text-sm text-gray-400">
                            Mostrando órdenes del periodo: <span className="text-white font-bold">{dateRangeLabel}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Sub-Header Stats */}
                <div className="grid grid-cols-2 gap-px bg-white/5 border-b border-white/5">
                    <div className="p-4 flex items-center justify-center gap-4 hover:bg-white/5 transition-colors">
                        <div className="p-3 bg-orange-500/20 rounded-full text-orange-400">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Pedidos</p>
                            <p className="text-2xl font-black text-white">{orders.length}</p>
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-center gap-4 hover:bg-white/5 transition-colors">
                        <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Completados/Pagos</p>
                            <p className="text-2xl font-black text-white">
                                {orders.filter(o => ['completed', 'paid'].includes(o.status)).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-white/5 bg-black/20">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por ID de pedido o nombre de cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Orders List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {filteredOrders.length > 0 ? (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group flex flex-col md:flex-row gap-4 md:items-center">

                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-sm text-gray-500">#{order.id.slice(0, 8)}</span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-300">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                                {format(new Date(order.created_at), "d MMM, HH:mm", { locale: es })}
                                            </div>
                                            {order.profiles && (
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-gray-500" />
                                                    {order.profiles.first_name || 'Cliente'} {order.profiles.last_name || ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Items Summary */}
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-1">Items ({order.order_items?.length || 0})</p>
                                        <div className="text-sm text-white/80 line-clamp-1">
                                            {order.order_items?.map(i => `${i.quantity}x ${i.products?.name}`).join(', ')}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="text-right min-w-[120px]">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Total</p>
                                        <p className="text-2xl font-black text-white">${order.total?.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                            <AlertCircle className="w-12 h-12 mb-3 text-gray-700" />
                            <p className="text-lg font-medium">No se encontraron pedidos</p>
                            <p className="text-sm">Prueba con otro término de búsqueda</p>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-white/5 bg-gray-900/50 text-center text-xs text-gray-500">
                    Mostrando {filteredOrders.length} de {orders.length} pedidos del periodo
                </div>
            </div>
        </div>
    )
}

export default PeriodOrdersModal
