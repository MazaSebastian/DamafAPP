import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react'
import { toast } from 'sonner'
// AdminLayout import removed

// Note: If AdminLayout doesn't exist, I'll remove it. Based on finding results earlier, I didn't see it.
// I'll assume standard layout for now.

const POSPage = () => {
    const [products, setProducts] = useState([])
    const [cart, setCart] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    // Initial Load
    useEffect(() => {
        fetchProducts()
    }, [])

    // Realtime Sync to Customer Display
    useEffect(() => {
        updateCustomerDisplay()
    }, [cart])

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)

        if (data) setProducts(data)
        setLoading(false)
    }

    const updateCustomerDisplay = async () => {
        // Calculate totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const total = subtotal // Add tax logic if needed

        const payload = {
            status: cart.length > 0 ? 'active' : 'idle',
            cart_items: cart,
            subtotal: subtotal,
            total: total,
            updated_at: new Date().toISOString()
        }

        // We update the singleton row
        await supabase
            .from('checkout_sessions')
            .update(payload)
            .eq('id', '00000000-0000-0000-0000-000000000000')
    }

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id)
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(p => p.id !== productId))
    }

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(p => {
            if (p.id === productId) {
                const newQty = Math.max(0, p.quantity + delta)
                return { ...p, quantity: newQty }
            }
            return p
        }).filter(p => p.quantity > 0))
    }

    const handleCheckout = async (method) => {
        // Here you would save the order to 'orders' table
        // For now, let's just show success on the customer display

        await supabase
            .from('checkout_sessions')
            .update({
                status: 'payment_success',
                payment_method: method
            })
            .eq('id', '00000000-0000-0000-0000-000000000000')

        toast.success(`Pago con ${method} registrado`)

        // Reset local cart after a delay or immediately
        setTimeout(() => {
            setCart([])
            // Sync will happen automatically via useEffect -> updateCustomerDisplay
        }, 3000)
    }

    if (loading) return <div className="p-10 text-white">Cargando POS...</div>

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'all' || p.category === selectedCategory)
    )

    return (
        <div className="flex h-screen bg-[var(--color-background)] text-white overflow-hidden">
            {/* LEFT: Product Grid (65%) */}
            <div className="w-[65%] flex flex-col border-r border-white/5">
                {/* Header / Search */}
                <div className="p-6 border-b border-white/5 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full bg-[var(--color-surface)] rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 ring-[var(--color-primary)] transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Category Filter Pills could go here */}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
                    {filteredProducts.map(product => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="bg-[var(--color-surface)] p-4 rounded-xl border border-white/5 hover:border-[var(--color-primary)] transition-all text-left flex flex-col h-40 relative group"
                        >
                            <div className="flex-1">
                                <h3 className="font-bold line-clamp-2">{product.name}</h3>
                                <p className="text-[var(--color-text-muted)] text-sm absolute bottom-4 left-4">${product.price}</p>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-primary)] rounded-full p-1">
                                <Plus className="w-4 h-4" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT: Cart (35%) */}
            <div className="w-[35%] flex flex-col bg-[var(--color-surface)]">
                <div className="p-6 border-b border-white/5 font-bold text-xl flex items-center gap-2">
                    <ShoppingCart /> Carrito Actual
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-[var(--color-background)] p-3 rounded-lg">
                            <div>
                                <div className="font-bold">{item.name}</div>
                                <div className="text-sm text-[var(--color-text-muted)]">${item.price}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white/10 rounded"><Minus className="w-4 h-4" /></button>
                                <span className="font-mono w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white/10 rounded"><Plus className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="text-center text-[var(--color-text-muted)] mt-10">Vacío</div>
                    )}
                </div>

                <div className="p-6 bg-[var(--color-background)] border-t border-white/5 space-y-4">
                    <div className="flex justify-between text-2xl font-bold">
                        <span>Total</span>
                        <span>${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleCheckout('cash')}
                            className="bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1"
                            disabled={cart.length === 0}
                        >
                            <Banknote /> Efectivo
                        </button>
                        <button
                            onClick={() => handleCheckout('mercadopago')}
                            className="bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1"
                            disabled={cart.length === 0}
                        >
                            <CreditCard /> MP / QR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default POSPage
