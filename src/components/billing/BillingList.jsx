import React from 'react';
import { FileText, Download, User } from 'lucide-react';

const BillingList = () => {
    // Mock Data
    const invoices = [
        { id: 1, date: '2024-01-26', type: 'Factura B', number: '0005-00001234', amount: 4500.00, customer: 'Consumidor Final', cae: '73412345678901' },
        { id: 2, date: '2024-01-26', type: 'Factura B', number: '0005-00001233', amount: 12500.50, customer: 'Sebastian Maza', cae: '73412345678902' },
        { id: 3, date: '2024-01-25', type: 'Factura A', number: '0005-00001232', amount: 32000.00, customer: 'Empresa SA', cae: '73412345678903' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Historial de Comprobantes</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Buscar por cliente o número..."
                        className="bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-primary)] w-64"
                    />
                </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-white/10 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-white/60">
                            <tr>
                                <th className="p-4 font-medium">Fecha</th>
                                <th className="p-4 font-medium">Comprobante</th>
                                <th className="p-4 font-medium">Cliente</th>
                                <th className="p-4 font-medium">CAE</th>
                                <th className="p-4 font-medium text-right">Monto</th>
                                <th className="p-4 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="text-white hover:bg-white/5 transition-colors">
                                    <td className="p-4">{inv.date}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-[var(--color-primary)] text-black text-xs font-bold px-1.5 rounded">
                                                {inv.type.split(' ')[1]}
                                            </span>
                                            <span className="font-mono text-white/80">{inv.number}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-white/80">
                                            <User size={14} />
                                            {inv.customer}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-white/60">{inv.cae}</td>
                                    <td className="p-4 text-right font-bold">
                                        ${inv.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Ver PDF">
                                            <FileText size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-[var(--color-primary)] transition-colors" title="Descargar">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {invoices.length === 0 && (
                <div className="text-center py-12 text-white/40">
                    No hay comprobantes generados aún.
                </div>
            )}
        </div>
    );
};

export default BillingList;
