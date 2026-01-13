import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children, role }) => {
    const { user, role: userRole, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (role && userRole !== role && userRole !== 'owner') {
        // Allow owner to access everything admin can
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
