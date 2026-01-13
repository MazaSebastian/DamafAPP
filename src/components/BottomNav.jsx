import { Home, UtensilsCrossed, User, Ticket, ShoppingBag } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const BottomNav = () => {
    const location = useLocation()
    const currentPath = location.pathname

    return (
        <nav className="fixed bottom-0 w-full bg-[var(--color-surface)] border-t border-white/5 px-4 pb-4 pt-2 flex justify-between items-end z-50 h-[80px]">

            {/* Left Group */}
            <div className="flex gap-1">
                <Link to="/my-orders" className="flex-1 min-w-[60px]">
                    <NavItem
                        icon={<ShoppingBag className="w-5 h-5" />}
                        label="Pedidos"
                        active={currentPath === '/my-orders'}
                    />
                </Link>
                <Link to="/menu" className="flex-1 min-w-[60px]">
                    <NavItem
                        icon={<UtensilsCrossed className="w-5 h-5" />}
                        label="Pide aquí"
                        active={currentPath === '/menu'}
                    />
                </Link>
            </div>

            {/* Center Home Button */}
            <div className="relative -top-5">
                <Link to="/">
                    <div className={`p-4 rounded-full shadow-lg shadow-orange-500/20 transition-all transform hover:scale-105 ${currentPath === '/' ? 'bg-[var(--color-secondary)] text-white' : 'bg-[#2a2a2a] text-gray-400 border border-white/10'}`}>
                        <Home className="w-8 h-8" />
                    </div>
                </Link>
                {/* <span className="absolute -bottom-5 w-full text-center text-[10px] font-bold text-[var(--color-secondary)]">INICIO</span> */}
            </div>

            {/* Right Group */}
            <div className="flex gap-1">
                <Link to="/coupons" className="flex-1 min-w-[60px]">
                    <NavItem
                        icon={<Ticket className="w-5 h-5" />}
                        label="Cupones"
                        active={currentPath === '/coupons'}
                    />
                </Link>
                <Link to="/profile" className="flex-1 min-w-[60px]">
                    <NavItem
                        icon={<User className="w-5 h-5" />}
                        label="Cuenta"
                        active={currentPath === '/profile'}
                    />
                </Link>
            </div>

        </nav>
    )
}

const NavItem = ({ icon, label, active }) => (
    <div className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${active ? 'text-[var(--color-secondary)] bg-[var(--color-secondary)]/10' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'}`}>
        {icon}
        <span className="text-[9px] font-bold tracking-wide uppercase">{label}</span>
    </div>
)

export default BottomNav
