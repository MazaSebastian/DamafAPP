import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import LandingPage from '../components/LandingPage'
import UserHome from '../components/UserHome'

const HomePage = () => {
    const { user, role } = useAuth()

    // Redirect Admins/Owners to Admin Dashboard
    if (role === 'admin' || role === 'owner') {
        return <Navigate to="/admin" replace />
    }

    // Guest View (Not logged in)
    if (!user) {
        return <LandingPage />
    }

    // Authenticated View (Logged in)
    return <UserHome />
}

export default HomePage
