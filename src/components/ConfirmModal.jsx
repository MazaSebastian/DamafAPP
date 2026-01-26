import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = false }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
                        className="fixed top-1/2 left-1/2 w-[90%] max-w-sm bg-[var(--color-surface)] border border-white/10 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] z-[9999] p-6 overflow-hidden"
                        style={{
                            boxShadow: isDestructive
                                ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.2)'
                                : '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                        }}
                    >
                        {/* Glow Effect */}
                        {isDestructive && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
                        )}

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-white/10 text-white'}`}>
                                <AlertTriangle className="w-8 h-8" />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white">{title}</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">{message}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full pt-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-xl font-bold text-sm bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm()
                                        onClose()
                                    }}
                                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${isDestructive
                                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/20'
                                        : 'bg-[var(--color-secondary)] hover:bg-orange-600 text-white'
                                        }`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ConfirmModal
