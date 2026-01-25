import { useEffect } from 'react';
import { toast } from 'sonner';
import { requestForToken, onMessageListener } from '../services/messaging';
import { useAuth } from '../context/AuthContext';

const useFCM = () => {
    const { user } = useAuth();

    useEffect(() => {
        // Trigger Prompt if:
        // 1. User is logged in
        // 2. Browser supports it
        // 3. Permission is 'default' (not granted/denied yet)
        // 4. Not dismissed recently (24h cooldown)
        if (user && 'Notification' in window && Notification.permission === 'default') {
            const lastPrompt = localStorage.getItem('last_notif_prompt');
            const now = Date.now();

            if (!lastPrompt || (now - parseInt(lastPrompt) > 24 * 60 * 60 * 1000)) {

                // Show Custom Toast
                toast('🔔 ¿Quieres saber cuándo llega tu comida?', {
                    description: 'Activa las notificaciones para recibir actualizaciones en tiempo real de tus pedidos.',
                    duration: Infinity, // Stay until interaction
                    action: {
                        label: 'Activar',
                        onClick: async () => {
                            toast.info('Solicitando permiso...');
                            const { token, error } = await requestForToken(user.id);
                            if (token) toast.success('¡Genial! Te avisaremos 🛵');
                            else if (error === 'permission_denied') toast.error('Permiso denegado desde el navegador.');
                        }
                    },
                    cancel: {
                        label: 'Ahora no',
                        onClick: () => {
                            localStorage.setItem('last_notif_prompt', Date.now().toString());
                        }
                    },
                    style: {
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                        border: '1px solid rgba(224, 2, 1, 0.3)',
                    }
                });
            }
        }
    }, [user]);

    useEffect(() => {
        const unsubscribe = onMessageListener().then((payload) => {
            const { title, body, image } = payload.notification;

            // Show toast
            toast(title, {
                description: body,
                duration: 6000,
                icon: image ? <img src={image} alt="icon" className="w-8 h-8 rounded-full object-cover" /> : '🔔',
                action: {
                    label: 'Ver',
                    onClick: () => console.log('Notification clicked', payload)
                }
            });
            console.log('Foreground message received:', payload);
        }).catch(err => console.log('Failed: ', err));

        // onMessage returns an unsubscribe function if using the direct firebase API, 
        // but our wrapper returns a promise. 
        // Realistically, the listener stays active. To simple unsubscribe we'd need to refactor service.
        // For now, this simple implementation attaches new listeners on mount.
        // Ideally, move onMessage logic here or make service return unsubscriber.

    }, []);
};

export default useFCM;
