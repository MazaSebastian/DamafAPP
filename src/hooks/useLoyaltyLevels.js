import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'

export const useLoyaltyLevels = () => {
    const { getSetting, loading: settingsLoading } = useSettings()
    const { profile } = useAuth()

    const lifetimeStars = profile?.lifetime_stars || 0

    // Fetch dynamic settings (with defaults if missing)
    const LEVEL_GREEN_MIN = getSetting('loyalty_level_green', 50, 'number')
    const LEVEL_GOLD_MIN = getSetting('loyalty_level_gold', 300, 'number')
    const REWARD_CYCLE = 100 // Hardcoded for now, or could be a setting too

    // Define Levels based on dynamic settings
    const LEVELS = [
        {
            name: 'Welcome',
            min: 0,
            max: LEVEL_GREEN_MIN - 1,
            color: 'text-gray-400',
            bg: 'bg-gray-400',
            benefits: ['Bebida de cumpleaños']
        },
        {
            name: 'Green',
            min: LEVEL_GREEN_MIN,
            max: LEVEL_GOLD_MIN - 1,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500',
            benefits: ['Refill Café del Día', 'Ofertas especiales']
        },
        {
            name: 'Gold',
            min: LEVEL_GOLD_MIN,
            max: Infinity,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400',
            benefits: ['Bebida Alta cada 100 stars', 'Eventos VIP', 'Gold Card Digital']
        }
    ]

    // Calculate current level
    let currentLevelIndex = 0
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (lifetimeStars >= LEVELS[i].min) {
            currentLevelIndex = i
            break
        }
    }

    const currentLevel = LEVELS[currentLevelIndex]
    const nextLevel = LEVELS[currentLevelIndex + 1] || null

    let progress = 0
    let starsToNext = 0

    if (nextLevel) {
        // Calculate progress to next level
        const totalRange = nextLevel.min - currentLevel.min
        const currentProgress = lifetimeStars - currentLevel.min
        progress = (currentProgress / totalRange) * 100
        starsToNext = nextLevel.min - lifetimeStars
    } else {
        // Max level reached (Gold)
        // For Gold, calculate progress towards next free drink (every REWARD_CYCLE stars)
        const starsSinceGold = lifetimeStars - currentLevel.min
        const starsTowardsNextDrink = starsSinceGold % REWARD_CYCLE
        progress = (starsTowardsNextDrink / REWARD_CYCLE) * 100 // 0 to 100
        starsToNext = REWARD_CYCLE - starsTowardsNextDrink
    }

    return {
        currentLevel,
        nextLevel,
        progress: Math.min(Math.max(progress, 0), 100), // Clamp 0-100
        starsToNext,
        loading: settingsLoading
    }
}
