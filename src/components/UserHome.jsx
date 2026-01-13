import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import LoyaltyBanner from './LoyaltyBanner'
import NewsCard from './NewsCard'
import BottomNav from './BottomNav'
import FloatingOrderButton from './FloatingOrderButton'
import { NewsSkeleton } from './skeletons/NewsSkeleton'
import StoreInfoHeader from './StoreInfoHeader'

const UserHome = () => {
    const { user, profile, role, signOut } = useAuth()
    const [news, setNews] = useState([])
    const [loading, setLoading] = useState(true)

    // Use stars from global profile if available
    const stars = profile?.stars || 0

    console.log('UserHome Render. Loading:', loading, 'Stars:', stars)

    // ... useEffect remains the same ...

    useEffect(() => {
        let mounted = true

        // Timeout force show
        const timeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Home news loading timed out - Forcing display')
                setLoading(false)
            }
        }, 3000)

        const fetchNews = async () => {
            try {
                console.log('Fetching news...')
                const { data: newsData, error: newsError } = await supabase
                    .from('news_events')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (newsError) throw newsError

                if (newsData && mounted) {
                    setNews(newsData)
                }
            } catch (error) {
                console.error('Error fetching news:', error)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        fetchNews()

        return () => {
            mounted = false
            clearTimeout(timeout)
        }
    }, [])

    return (
        <div className="min-h-screen bg-[var(--color-background)] pb-24">

            {/* Top Header */}
            <header className="px-4 py-6 flex justify-between items-center relative z-10">
                <div></div>



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
