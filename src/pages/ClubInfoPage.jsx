import { Link } from 'react-router-dom'
import { ChefHat, ArrowLeft } from 'lucide-react'

const ClubInfoPage = () => {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)] flex flex-col relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-secondary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            {/* Header */}
            <header className="fixed top-0 w-full p-4 flex items-center z-50">
                <Link to="/" className="p-2 bg-[var(--color-surface)] rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 max-w-md mx-auto text-center z-10 animate-fade-in-up">
                {/* Logo/Icon */}
                <div className="bg-[var(--color-surface)] p-6 rounded-3xl shadow-2xl shadow-orange-500/10 mb-8 border border-white/5 transform hover:scale-105 transition-transform duration-500">
                    <ChefHat className="w-16 h-16 text-[var(--color-secondary)]" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-4">
                    DAMAFAPP <span className="text-[var(--color-secondary)]">CLUB</span>
                </h1>

                {/* Description */}
                <p className="text-[var(--color-text-muted)] text-lg leading-relaxed mb-10">
                    ¡Crea una cuenta o ingresa si es que ya tienes una para que puedas canjear tus puntos por hamburguesas gratis!
                    <br /><br />
                    Haz click en el botón de abajo para unirte al club más delicioso.
                </p>

                {/* CTA Button */}
                <Link to="/login" className="w-full bg-[var(--color-secondary)] hover:bg-orange-600 text-white font-bold text-xl py-4 rounded-full shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1">
                    UNIRME AL CLUB
                </Link>

                <p className="mt-6 text-sm text-[var(--color-text-muted)]">
                    ¿Ya tienes cuenta? <Link to="/login" className="text-[var(--color-secondary)] font-semibold hover:underline">Ingresa aquí</Link>
                </p>
            </div>
        </div>
    )
}

export default ClubInfoPage
