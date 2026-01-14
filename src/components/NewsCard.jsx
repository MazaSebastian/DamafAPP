import { useState } from 'react'
import { ArrowRight, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import GuestAlertModal from './GuestAlertModal'

const NewsCard = ({ item }) => {
    const { user } = useAuth()
    const [isExpanded, setIsExpanded] = useState(false)
    const [showGuestModal, setShowGuestModal] = useState(false)

    const handleExpand = () => {
        if (!user) {
            setShowGuestModal(true)
            return
        }
        setIsExpanded(!isExpanded)
    }

    return (
        <>
            <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-lg border border-white/5 mb-6 group">
                {/* Image Container */}
                <div className="relative h-48 md:h-64 overflow-hidden">
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                            <span className="text-4xl">🍔</span>
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <span className="bg-[var(--color-secondary)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                            {item.type || 'Novedad'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-xl font-bold mb-2 text-white leading-tight">{item.title}</h3>

                    <div className="relative">
                        {/* Description - Clickbait Style (Hidden when collapsed) */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-[var(--color-text-muted)] text-sm mb-4">
                                        {item.description}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleExpand}
                        className="w-full bg-[var(--color-background)] hover:bg-[var(--color-primary)] border border-[var(--color-primary)]/50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:border-[var(--color-secondary)] group-hover:text-[var(--color-secondary)] group-hover:bg-[var(--color-surface)] active:scale-95"
                    >
                        {isExpanded ? (
                            <>
                                Cerrar
                                <ChevronUp className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                {item.action_text || 'Ver más'}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            <GuestAlertModal
                isOpen={showGuestModal}
                onClose={() => setShowGuestModal(false)}
                onContinueAsGuest={() => setShowGuestModal(false)} // Or handle differently if needed
            />
        </>
    )
}

export default NewsCard
