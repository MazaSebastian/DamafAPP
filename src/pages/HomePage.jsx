import { useAuth } from '../context/AuthContext'
import LandingPage from '../components/LandingPage'
import UserHome from '../components/UserHome'

const HomePage = () => {
    const { user } = useAuth()

    // Guest View (Not logged in)
    if (!user) {
        return <LandingPage />
    }

    // Authenticated View (Logged in)
    return <UserHome />
}

export default HomePage
