import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Loader2, Check, Clock, X, ChefHat, Bell, Trash2, Banknote, CreditCard, Printer, Usb } from 'lucide-react'
import { toast } from 'sonner'
import TicketTemplate from './print/TicketTemplate'
import { EscPosEncoder } from '../utils/escPosEncoder'
import { usbPrinter } from '../services/UsbPrinterService'
import { format } from 'date-fns'

const OrdersManager = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [usbConnected, setUsbConnected] = useState(false)

    const connectPrinter = async () => {
        try {
            await usbPrinter.connect()
            setUsbConnected(true)
            toast.success('Impresora USB Conectada 🔌')
        } catch (err) {
            console.error(err)
            toast.error('No se pudo conectar impresora USB')
        }
    }

    const printViaUsb = async (order) => {
        try {
            const encoder = new EscPosEncoder()
                .initialize()
                .align('center')
                .bold(true)
                .size(2, 2)
                .text('DamafAPP')
                .newline()
                .size(1, 1) // Normal
                .text('La mejor hamburguesa del barrio')
                .newline()
                .text(format(new Date(order.created_at), 'dd/MM/yyyy HH:mm'))
                .newline(2)

                .size(2, 2)
                .text(`ORDEN #${order.id.slice(0, 4)}`)
                .newline(2)

                .size(1, 1)
                .align('left')
                .text(`Cliente: ${order.profiles?.full_name || 'Invitado'}`)
                .newline()

            if (order.order_type === 'delivery') {
                encoder.text(`DELIVERY - ${order.delivery_address || ''}`)
            } else {
                encoder.text('RETIRO EN LOCAL')
            }
            encoder.newline(2)

            // Items
            encoder.align('left')
            order.order_items?.forEach(item => {
                encoder.bold(true).text(`${item.quantity}x ${item.products?.name}`).newline()
                encoder.bold(false)

                if (item.modifiers?.length > 0) {
                    item.modifiers.forEach(m => {
                        encoder.text(`  + ${m.name}`).newline()
                    })
                }
                if (item.side_info) encoder.text(`  + ${item.side_info.name}`).newline()
                if (item.drink_info) encoder.text(`  + ${item.drink_info.name}`).newline()

                encoder.text(`  $${item.price_at_time}`).newline()
                encoder.newline() // Spacing
            })

            encoder.line()

            // Totals
            encoder.align('right').size(2, 2).bold(true)
                .text(`TOTAL: $${order.total}`)
                .newline(2)

            // Footer
            encoder.size(1, 1).align('center').bold(false)
                .text('www.damafapp.com')
                .newline(3)
                .cut()

            await usbPrinter.print(encoder.encode())
            toast.success('Impreso via USB 🖨️')
        } catch (err) {
            console.error('USB Print failed', err)
            toast.error('Error USB. Intentando modo clásico...')
            // Fallback
            handleWindowPrint(order)
        }
    }

    const handleWindowPrint = (order) => {
        setPrintingOrder(order)
        setTimeout(() => {
            window.print()
        }, 100)
    }

    const handlePrint = (order) => {
        if (usbConnected) {
            printViaUsb(order)
        } else {
            handleWindowPrint(order)
        }
    }

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--color-secondary)]" /></div>

    return (
        <div className="space-y-6">
            {/* Hidden Ticket Template for Printing */}
            <div className="hidden">
                <TicketTemplate order={printingOrder} />
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ChefHat className="text-[var(--color-secondary)]" />
                    Gestión de Pedidos
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={connectPrinter}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg ${usbConnected ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-500'}`}
                    >
                        <Usb className="w-4 h-4" />
                        {usbConnected ? 'Impresora Conectada' : 'Conectar Impresora'}
                    </button>
                    <button
                        onClick={clearAllOrders}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                    >
                        <Trash2 className="w-4 h-4" />
                        Borrar TODO
                    </button>
                    <button
                        onClick={clearHistory}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Limpiar Completados
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders.map(order => (
                    <div key={order.id} className={`bg-[var(--color-surface)] rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${order.status === 'packaging'
                        ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                        : 'border-white/5'
                        }`}>
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 bg-[var(--color-background)]/50 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold">#{order.id.slice(0, 8)}</span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <span className="text-xs text-[var(--color-text-muted)]">
                                    {new Date(order.created_at).toLocaleString()}
                                </span>
                                {order.order_type === 'delivery' ? (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-blue-400 font-medium">
                                        <Bell className="w-3 h-3" /> Delivery
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-green-400 font-medium">
                                        <ChefHat className="w-3 h-3" /> Take Away
                                    </div>
                                )}
                                {order.delivery_address && (
                                    <div className="text-xs text-white/70 italic mt-0.5 max-w-[150px] truncate">
                                        📍 {order.delivery_address}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[var(--color-primary)]">
                                    {order.payment_method === 'cash' && <><Banknote className="w-3 h-3" /> Efectivo</>}
                                    {order.payment_method === 'transfer' && <><Banknote className="w-3 h-3" /> Transferencia</>}
                                    {order.payment_method === 'mercadopago' && <><CreditCard className="w-3 h-3" /> MercadoPago</>}
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <span className="font-bold text-lg block">${order.total}</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handlePrint(order)}
                                        className="text-[var(--color-text-muted)] hover:text-white p-1 rounded hover:bg-white/10"
                                        title="Imprimir Ticket"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteOrder(order.id)}
                                        className="text-[var(--color-text-muted)] hover:text-red-400 p-1 rounded hover:bg-white/10"
                                        title="Eliminar pedido"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="p-4 flex-1 space-y-3">
                            {order.order_items?.map(item => (
                                <div key={item.id} className="text-sm">
                                    <div className="flex justify-between font-medium">
                                        <span>1x {item.products?.name}</span>
                                        <span className="text-[var(--color-text-muted)]">${item.price_at_time}</span>
                                    </div>

                                    {/* Sub-items details */}
                                    <div className="pl-4 border-l border-white/10 mt-1 text-xs text-[var(--color-text-muted)] space-y-0.5">
                                        {item.modifiers?.map((m, i) => (
                                            <div key={i}>+ {m.name} {m.quantity > 1 ? <span className="text-white font-bold">x{m.quantity}</span> : ''}</div>
                                        ))}
                                        {item.side_info && <div>+ {item.side_info.name}</div>}
                                        {item.drink_info && <div>+ {item.drink_info.name}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="p-3 bg-[var(--color-background)]/30 grid grid-cols-3 gap-2">
                            {order.status === 'pending' && (
                                <div className="col-span-3 space-y-2">
                                    {/* Primary Actions: Accept / Reject */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                handlePrint(order)
                                                updateStatus(order.id, 'cooking')
                                            }}
                                            className="bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                        >
                                            <Check className="w-4 h-4" /> Aceptar
                                        </button>

                                        <button
                                            onClick={() => {
                                                toast('¿Rechazar pedido?', {
                                                    action: {
                                                        label: 'Sí, Rechazar',
                                                        onClick: () => updateStatus(order.id, 'rejected')
                                                    },
                                                })
                                            }}
                                            className="bg-red-500/10 text-red-500 py-2 rounded-lg font-bold text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" /> Rechazar
                                        </button>
                                    </div>

                                    {/* Secondary Action: Confirm Payment (if needed) */}
                                    {!order.is_paid && order.payment_method !== 'cash' && (
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase.from('orders').update({ is_paid: true }).eq('id', order.id)
                                                if (!error) {
                                                    setOrders(orders.map(o => o.id === order.id ? { ...o, is_paid: true } : o))
                                                    toast.success('Pago confirmado')
                                                } else {
                                                    toast.error('Error al confirmar pago')
                                                }
                                            }}
                                            className="w-full bg-blue-500/10 text-blue-400 py-1.5 rounded-lg font-medium text-xs hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Banknote className="w-3 h-3" /> Confirmar recepción del pago
                                        </button>
                                    )}
                                </div>
                            )}
                            {order.status === 'cooking' && (
                                <div className="col-span-3 space-y-2">
                                    <button onClick={() => updateStatus(order.id, 'packaging')} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" /> Preparar Envío
                                    </button>

                                    {/* Still show Confirm Payment if enabled and not paid */}
                                    {!order.is_paid && order.payment_method !== 'cash' && (
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase.from('orders').update({ is_paid: true }).eq('id', order.id)
                                                if (!error) {
                                                    setOrders(orders.map(o => o.id === order.id ? { ...o, is_paid: true } : o))
                                                    toast.success('Pago confirmado')
                                                } else {
                                                    toast.error('Error al confirmar pago')
                                                }
                                            }}
                                            className="w-full bg-blue-500/10 text-blue-400 py-1.5 rounded-lg font-medium text-xs hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Banknote className="w-3 h-3" /> Confirmar recepción del pago
                                        </button>
                                    )}
                                </div>
                            )}
                            {order.status === 'packaging' && (
                                <button onClick={() => updateStatus(order.id, 'sent')} className="col-span-3 bg-purple-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-purple-500 transition-colors flex items-center justify-center gap-2">
                                    <Bell className="w-4 h-4" /> Enviar Pedido
                                </button>
                            )}
                            {order.status === 'sent' && (
                                <button onClick={() => updateStatus(order.id, 'completed')} className="col-span-3 bg-gray-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-gray-500 transition-colors flex items-center justify-center gap-2">
                                    <Check className="w-4 h-4" /> Finalizar / Entregado
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="col-span-full py-20 text-center text-[var(--color-text-muted)]">
                        No hay pedidos recientes.
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrdersManager
