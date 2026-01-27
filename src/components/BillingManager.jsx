import React, { useState } from 'react';
import { LayoutDashboard, FileText, Settings, FileSpreadsheet } from 'lucide-react';
import BillingOverview from './billing/BillingOverview';
import BillingList from './billing/BillingList';
import BillingSettings from './billing/BillingSettings';

const BillingManager = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'General', icon: LayoutDashboard },
        { id: 'invoices', label: 'Comprobantes', icon: FileSpreadsheet },
        { id: 'settings', label: 'Configuración', icon: Settings },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Centro de Facturación
                    </h2>
                    <p className="text-white/60 mt-1">
                        Gestiona tus comprobantes electrónicos y credenciales de ARCA (AFIP).
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                                ${isActive
                                    ? 'bg-[var(--color-primary)] text-black shadow-lg shadow-[var(--color-primary)]/20'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && <BillingOverview onChangeTab={setActiveTab} />}
                {activeTab === 'invoices' && <BillingList />}
                {activeTab === 'settings' && <BillingSettings />}
            </div>
        </div>
    );
};

export default BillingManager;
