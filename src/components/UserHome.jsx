import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, UtensilsCrossed, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import LoyaltyBanner from './LoyaltyBanner'
import NewsCard from './NewsCard'
import BottomNav from './BottomNav'
import FloatingOrderButton from './FloatingOrderButton'
import { NewsSkeleton } from './skeletons/NewsSkeleton'
import Sidebar from './Sidebar'
import StoreInfoHeader from './StoreInfoHeader'

const UserHome = () => {
    const { user, role, signOut } = useAuth()
    const [stars, setStars] = useState(0)
    const [news, setNews] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        let mounted = true
        // Safety timeout
        const timeout = setTimeout(() => {
            if (mounted) {
                console.warn('Home loading timed out')
                setLoading(false)
            }
        }, 5000)

        const fetchData = async () => {
            try {
                // Fetch User Stars
                if (user) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('stars')
                        .eq('id', user.id)
                        .single()

                    if (!profileError && profile && mounted) {
                        setStars(profile.stars || 0)
                    }
                }

                // Fetch News
                const { data: newsData, error: newsError } = await supabase
                    .from('news_events')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (!newsError && newsData && mounted) {
                    setNews(newsData)
                }
            } catch (error) {
                console.error('Error fetching home data:', error)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        fetchData()

        return () => {
            mounted = false
            clearTimeout(timeout)
        }
    }, [user])

    return (
        <div className="min-h-screen bg-[var(--color-background)] pb-24">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Top Header */}
            {/* Top Header */}
            <header className="px-4 py-6 flex justify-between items-center relative z-10">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors relative z-20"
                >
                    <Menu className="w-6 h-6" />
                </button>



                {/* Admin Link or Sign Out */}
                <div className="flex gap-2 items-center relative z-20">
                    {role === 'admin' && (
                        <Link to="/admin" className="text-white text-[10px] font-bold px-3 py-1.5 rounded-full bg-[var(--color-primary)] hover:bg-purple-700 transition-colors border border-transparent uppercase tracking-wider">
                            Admin
                        </Link>
                    )}
                    <button onClick={signOut} className="text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors uppercase tracking-wider">
                        Salir
                    </button>
                </div>
            </header>

            {/* Store Info Header */}
            <div className="pt-2">
                <StoreInfoHeader />
            </div>

            {/* Main Content */}
            <main className="px-4 max-w-lg mx-auto pt-2">
                <LoyaltyBanner stars={stars} />

                {/* News Feed */}
                {loading ? (
                    <NewsSkeleton />
                ) : (
                    news.map(item => <NewsCard key={item.id} item={item} />)
                )}
            </main>

            <BottomNav />
            <FloatingOrderButton />
        </div>
    )
}

export default UserHome
