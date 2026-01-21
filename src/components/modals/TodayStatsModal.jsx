import { useState, useEffect } from 'react'
import { X, Search, ShoppingBag, Loader2, TrendingUp, AlertCircle } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { startOfDay, endOfDay } from 'date-fns'

const TodayStatsModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [stats, setStats] = useState({ totalItems: 0, totalRevenue: 0 })

    useEffect(() => {
        if (isOpen) {
            fetchTodayDetails()
        }
    }, [isOpen])

    const fetchTodayDetails = async () => {
        setLoading(true)
        try {
            const todayStart = startOfDay(new Date())

            // Fetch completed/paid orders for today with their items
            const { data: orders, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    status,
                    order_items (
                        quantity,
                        unit_price,
                        products (
                            name,
                            category_id
                        )
                    )
                `)
                .in('status', ['paid', 'completed', 'preparing', 'ready', 'sent'])
                .gte('created_at', todayStart.toISOString())

            if (error) throw error

            // Process data to aggregate by product
            const productMap = {}
            let totalItems = 0
            let totalRevenue = 0

            orders?.forEach(order => {
                order.order_items?.forEach(item => {
                    if (!item.products) return

                    const productName = item.products.name
                    const qty = item.quantity || 0
                    const price = item.unit_price || 0
                    const revenue = qty * price

                    if (!productMap[productName]) {
                        productMap[productName] = {
                            name: productName,
                            quantity: 0,
                            revenue: 0,
                            ordersCount: 0 // How many orders contain this product
                        }
                    }

                    productMap[productName].quantity += qty
                    productMap[productName].revenue += revenue
                    productMap[productName].ordersCount += 1

                    totalItems += qty
                    totalRevenue += revenue
                })
            })

            // Convert to array and sort by quantity desc
            const sortedProducts = Object.values(productMap).sort((a, b) => b.quantity - a.quantity)

            setProducts(sortedProducts)
            setStats({ totalItems, totalRevenue })

        } catch (error) {
            console.error("Error fetching today details:", error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ShoppingBag className="text-blue-400" />
                            Detalle de Ventas - HOY
                        </h2>
                        <p className="text-sm text-gray-400">Desglose de productos vendidos en el turno actual</p>
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
                        <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Productos Vendidos</p>
                            <p className="text-2xl font-black text-white">{stats.totalItems}</p>
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-center gap-4 hover:bg-white/5 transition-colors">
                        <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Facturación Productos</p>
                            <p className="text-2xl font-black text-white">${stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-white/5 bg-black/20">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar producto por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Product List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                            <p>Cargando ventas del día...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredProducts.map((product, idx) => (
                                <div key={idx} className="flex items-center p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mr-4 
                                        ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
                                            idx === 1 ? 'bg-gray-400/20 text-gray-400 border border-gray-400/20' :
                                                idx === 2 ? 'bg-orange-700/20 text-orange-700 border border-orange-700/20' :
                                                    'bg-white/5 text-gray-500'}
                                    `}>
                                        #{idx + 1}
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {product.name}
                                        </h4>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                            <span>En {product.ordersCount} pedidos</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-2 mb-1">
                                            <span className="text-2xl font-black text-white">{product.quantity}</span>
                                            <span className="text-xs font-bold text-gray-500 uppercase">Unidades</span>
                                        </div>
                                        <div className="text-sm font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md inline-block">
                                            ${product.revenue.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                            <AlertCircle className="w-12 h-12 mb-3 text-gray-700" />
                            <p className="text-lg font-medium">No se encontraron productos</p>
                            <p className="text-sm">Intenta con otro término de búsqueda</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/5 bg-gray-900/50 text-center text-xs text-gray-500">
                    Mostrando resultados en tiempo real para el día de hoy
                </div>
            </div>
        </div>
    )
}

export default TodayStatsModal
