import { supabase } from '../supabaseClient';
import { initMercadoPago as initMPSDK } from '@mercadopago/sdk-react';

// Helper to fetch Public Key dynamically
export const getMercadoPagoPublicKey = async () => {
    try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'mp_public_key')
            .single();

        if (error) throw error;
        return data?.value || null;
    } catch (error) {
        console.error('Error fetching MP Public Key:', error);
        return null;
    }
};

// Initialization helper
export const initMercadoPago = async () => {
    const key = await getMercadoPagoPublicKey();
    if (key) {
        console.log('Initializing Mercado Pago with Dynamic Key...');
        initMPSDK(key);
    } else {
        console.warn('Mercado Pago Public Key missing in settings. Payment components may fail.');
    }
}
