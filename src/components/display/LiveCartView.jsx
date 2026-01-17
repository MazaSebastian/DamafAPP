import { ShoppingBag, CreditCard, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'react-qr-code'

const LiveCartView = ({ session }) => {
    const { cart_items, subtotal, total, status, payment_method, qr_code_url } = session

    return (
        <div className="w-full h-screen bg-[var(--color-background)] text-white flex">

            {/* LEFT: Cart Items (65%) */}
            <div className="w-[65%] p-8 flex flex-col h-full border-r border-white/5">
                <header className="mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Resumen de Compra</h1>
                        <p className="text-[var(--color-text-muted)]">Revisa tus productos</p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-4">
                    <AnimatePresence mode="popLayout">
                        {cart_items?.map((item, index) => (
                            <motion.div
                                key={item.unique_id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-[var(--color-surface)] p-4 rounded-2xl border border-white/5 flex justify-between items-center"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Product Image placeholder if needed */}
                                    <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                                        <img src={item.image_url || '/placeholder-food.png'} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl">{item.products?.name || item.name}</h3>
                                        <div className="text-sm text-[var(--color-text-muted)] mt-1">
                                            {item.modifiers?.map(m => (
                                                <span key={m.name} className="block">• {m.name} (x{m.quantity || 1})</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold">${item.price * item.quantity}</span>
                                    <span className="text-sm text-[var(--color-text-muted)]">{item.quantity} x ${item.price}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {(!cart_items || cart_items.length === 0) && (
                        <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] text-xl italic opacity-50">
                            Esperando productos...
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Totals & Payment (35%) */}
            <div className="w-[35%] bg-[var(--color-surface)] p-8 flex flex-col h-full shadow-2xl relative">
                {/* Logo Top Right */}
                <div className="absolute top-8 right-8 mix-blend-screen opacity-50">
                    <img src="/logo-damaf.png" alt="" className="w-20" />
                </div>

                <div className="mt-auto space-y-6">
                    {/* Totals */}
                    <div className="space-y-4 p-6 bg-[var(--color-background)] rounded-3xl border border-white/5">
                        <div className="flex justify-between text-lg text-[var(--color-text-muted)]">
                            <span>Subtotal</span>
                            <span>${subtotal || 0}</span>
                        </div>
                        <div className="flex justify-between text-lg text-[var(--color-text-muted)]">
                            <span>Impuestos</span>
                            <span>$0.00</span>
                        </div>
                        <div className="h-px bg-white/10 my-4" />
                        <div className="flex justify-between text-4xl font-black text-[var(--color-primary)]">
                            <span>Total</span>
                            <span>${total || 0}</span>
                        </div>
                    </div>

                    {/* Payment / QR State */}
                    <div className="min-h-[300px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {status === 'payment_success' ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-center"
                                >
                                    <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
                                        <ChevronRight className="w-16 h-16 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">¡Pago Exitoso!</h2>
                                    <p className="text-[var(--color-text-muted)] text-xl">Gracias por tu compra</p>
                                </motion.div>

                            ) : qr_code_url ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center w-full"
                                >
                                    <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl mb-6">
                                        <QRCode value={qr_code_url} size={200} />
                                    </div>
                                    <h3 className="text-2xl font-bold flex items-center justify-center gap-3">
                                        <CreditCard className="text-[var(--color-primary)]" />
                                        Escanea para pagar
                                    </h3>
                                    <p className="text-[var(--color-text-muted)] mt-2">Aceptamos MercadoPago y tarjetas</p>
                                </motion.div>

                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center opacity-40"
                                >
                                    <ShoppingBag className="w-24 h-24 mx-auto mb-4" />
                                    <p className="text-xl">Armando tu pedido...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LiveCartView
