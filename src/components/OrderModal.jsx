import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, Loader2, Plus } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { toast } from 'sonner'

const OrderModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1) // 1: Burger, 2: Sides, 3: Drinks
    const [products, setProducts] = useState([])
    const [sides, setSides] = useState([])
    const [drinks, setDrinks] = useState([])

    const [selectedBurger, setSelectedBurger] = useState(null)
    const [selectedSide, setSelectedSide] = useState(null)

    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()
    const { addToCart } = useCart()

    useEffect(() => {
        if (isOpen) {
            resetModal()
            fetchBurgers()
        }
    }, [isOpen])

    const resetModal = () => {
        setStep(1)
        setSelectedBurger(null)
        setSelectedSide(null)
        setProducts([])
        setSides([])
        setDrinks([])
    }

    const fetchBurgers = async () => {
        setLoading(true)
        const { data: catData } = await supabase.from('categories').select('id').ilike('name', '%hamburguesa%').single()
        if (catData) {
            const { data } = await supabase.from('products').select('*').eq('category_id', catData.id).eq('is_available', true).order('price', { ascending: true })
            if (data) setProducts(data)
        }
        setLoading(false)
    }

    const fetchSides = async () => {
        setLoading(true)
        // Find categories like Papas or Acompañamientos
        const { data: catData } = await supabase.from('categories').select('id').or('name.ilike.%papa%,name.ilike.%acompañamiento%').limit(1).single()
        if (catData) {
            const { data } = await supabase.from('products').select('*').eq('category_id', catData.id).eq('is_available', true).order('price', { ascending: true })
            if (data) setSides(data)
        }
        setLoading(false)
    }

    const fetchDrinks = async () => {
        setLoading(true)
        const { data: catData } = await supabase.from('categories').select('id').ilike('name', '%bebida%').limit(1).single()
        if (catData) {
            const { data } = await supabase.from('products').select('*').eq('category_id', catData.id).eq('is_available', true).order('price', { ascending: true })
            if (data) setDrinks(data)
        }
        setLoading(false)
    }

    const handleSelectBurger = (burger) => {
        setSelectedBurger(burger)
        setStep(2)
        fetchSides()
    }

    const handleSelectSide = (side) => {
        setSelectedSide(side)
        setStep(3)
        fetchDrinks()
    }

    const handleSelectDrink = (drink) => {
        // Finalize Order
        if (!selectedBurger) return

        // Create a single Combo item for the cart
        // CartContext expects structure: { main: product, modifiers: [], side: product, drink: product }
        const comboItem = {
            main: { ...selectedBurger, notes: 'Desde modal rápido' },
            modifiers: [], // Initialize modifiers for the burger
            side: selectedSide ? { ...selectedSide } : null,
            drink: drink ? { ...drink } : null,
            // You can add a specific type or ID if needed by your CartContext logic, 
            // usually CartContext handles ID generation.
        }

        addToCart(comboItem)

        toast.success('¡Combo completo agregado!')
        onClose()
        navigate('/checkout')
    }

    const handleBack = () => {
        if (step === 3) {
            setStep(2)
            // Sides are already fetched, just need to ensure they render
        } else if (step === 2) {
            setStep(1)
        }
    }

    // Helper to get current list based on step
    const getCurrentList = () => {
        if (step === 1) return products
        if (step === 2) return sides
        if (step === 3) return drinks
        return []
    }

    const currentList = getCurrentList()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 500 }}
                        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#1a1a1a] rounded-t-3xl z-[70] max-h-[85vh] flex flex-col border-t border-white/10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center relative">
                            <div className="flex items-center gap-3">
                                {step > 1 && (
                                    <button onClick={handleBack} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                                        <ArrowLeft className="w-5 h-5 text-white" />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white italic leading-tight">
                                        {step === 1 && <>¡Elegí tu burga, <span className="text-[var(--color-secondary)]">campeón!</span> 🍔</>}
                                        {step === 2 && <>¿Con qué la vas a <span className="text-[var(--color-secondary)]">acompañar</span>, rey? 🍟</>}
                                        {step === 3 && <>¿Y para <span className="text-[var(--color-secondary)]">bajarla</span>? 🥤</>}
                                    </h2>
                                    {step === 1 && <p className="text-[var(--color-text-muted)] text-sm">Las mejores de la ciudad</p>}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-8 h-8 text-[var(--color-secondary)] animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {currentList.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => {
                                                if (step === 1) handleSelectBurger(product)
                                                else if (step === 2) handleSelectSide(product)
                                                else if (step === 3) handleSelectDrink(product)
                                            }}
                                            className="bg-[var(--color-surface)] rounded-xl overflow-hidden border border-white/5 active:scale-95 transition-transform cursor-pointer relative group"
                                        >
                                            <div className="aspect-square bg-white/5 relative">
                                                {product.image_url ? (
                                                    product.media_type === 'video' ? (
                                                        <video src={product.image_url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                                                    ) : (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    )
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                                        {step === 1 ? '🍔' : step === 2 ? '🍟' : '🥤'}
                                                    </div>
                                                )}

                                                {/* Hover Description - ONLY FOR STEP 1 */}
                                                {step === 1 && (
                                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                                        <p className="text-white text-xs text-center font-medium leading-relaxed line-clamp-5">
                                                            {product.description || "¡Una verdadera delicia!"}
                                                        </p>
                                                    </div>
                                                )}

                                                <button className="absolute bottom-2 right-2 bg-[var(--color-secondary)] p-1.5 rounded-full text-white shadow-lg z-20">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="p-3">
                                                <h3 className="font-bold text-sm text-white leading-tight mb-1">{product.name}</h3>
                                                <p className="text-[var(--color-secondary)] font-bold text-sm">${product.price}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Option to skip side (Step 2) or drink (Step 3) */}
                                    {(step === 2 || step === 3) && (
                                        <div
                                            onClick={() => step === 2 ? handleSelectSide(null) : handleSelectDrink(null)}
                                            className="bg-[var(--color-surface)]/50 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                        >
                                            <span className="text-2xl mb-2">👋</span>
                                            <p className="text-white font-bold text-sm text-center">
                                                {step === 2 ? 'Sin acompañamiento' : 'Sin bebida'}
                                            </p>
                                            <p className="text-[var(--color-text-muted)] text-xs">
                                                {step === 2 ? 'Solo la burga' : 'Tengo sed igual'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {(currentList.length === 0 && !loading) && (
                                <p className="text-center text-[var(--color-text-muted)] py-10">No encontramos productos :(</p>
                            )}

                            {step === 1 && (
                                <button onClick={() => { onClose(); navigate('/menu') }} className="w-full py-4 text-center text-[var(--color-text-muted)] text-sm underline mt-4">
                                    Ver menú completo
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default OrderModal
