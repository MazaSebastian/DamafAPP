import { format } from 'date-fns'

const TicketTemplate = ({ order, ref }) => {
    if (!order) return null

    return (
        <div id="ticket-print-area" className="hidden print:block bg-white text-black p-2 font-mono text-xs w-[80mm] leading-tight">
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-xl font-black uppercase mb-1">DamafAPP</h1>
                <p className="text-[10px]">La mejor hamburguesa del barrio</p>
                <p className="text-[10px] mt-1">{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</p>
                <p className="font-bold text-lg mt-2 border-b-2 border-black pb-2">Orden #{order.id.slice(0, 4)}</p>
            </div>

            {/* Customer Info */}
            <div className="mb-4 text-xs font-bold border-b border-black pb-2">
                <p>Cliente: {order.profiles?.full_name || 'Invitado'}</p>
                {order.order_type === 'delivery' ? (
                    <>
                        <p>DELIVERY</p>
                        <p className="truncate">Dir: {order.delivery_address}</p>
                    </>
                ) : (
                    <p>RETIRO EN LOCAL</p>
                )}
                {order.payment_method && <p>Pago: {order.payment_method.toUpperCase()}</p>}
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4 border-b border-black pb-4">
                {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex flex-col">
                        <div className="flex justify-between font-bold text-sm">
                            <span>{item.quantity}x {item.products?.name}</span>
                            <span>${item.price_at_time}</span>
                        </div>
                        {/* Modifiers */}
                        {(item.modifiers?.length > 0 || item.side_info || item.drink_info) && (
                            <div className="pl-2 mt-1 text-[10px] font-medium text-gray-800">
                                {item.modifiers?.map((m, i) => (
                                    <div key={i}>+ {m.name} {m.quantity > 1 ? `(x${m.quantity})` : ''}</div>
                                ))}
                                {item.side_info && <div>+ {item.side_info.name}</div>}
                                {item.drink_info && <div>+ {item.drink_info.name}</div>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="text-right text-lg font-black mb-6">
                <div className="flex justify-between text-xs font-normal">
                    <span>Subtotal</span>
                    <span>${order.total}</span>
                </div>
                {order.discount_amount > 0 && (
                    <div className="flex justify-between text-xs font-normal">
                        <span>Descuento</span>
                        <span>-${order.discount_amount}</span>
                    </div>
                )}
                {/* Note: if total stored includes shipping, we might need to separate it if we had stored shipping cost separately. 
                     For now assuming order.total is final to pay check. 
                 */}
                <div className="flex justify-between mt-2 border-t border-black pt-2 text-2xl">
                    <span>TOTAL</span>
                    <span>${order.total}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] whitespace-pre-line mb-8">
                ¡Gracias por tu compra!
                {'\n'}
                www.damafapp.com
                {'\n'}
                <p className="mt-2 font-bold">*** COMPROBANTE NO FISCAL ***</p>
            </div>
        </div>
    )
}

export default TicketTemplate
