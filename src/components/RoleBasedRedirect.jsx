import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Component that redirects users to their role-specific page
 * when they land on the home page
 */
const RoleBasedRedirect = ({ children }) => {
    const { role, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // Only redirect if we're on the home page and not loading
        if (loading || location.pathname !== '/') return

        // Redirect based on role
        if (role === 'kitchen') {
            navigate('/kds', { replace: true })
        } else if (role === 'admin' || role === 'owner') {
            navigate('/admin', { replace: true })
        } else if (role === 'rider' || role === 'driver') {
            navigate('/rider', { replace: true })
        }
        // Regular users stay on home page
    }, [role, loading, location.pathname, navigate])

    return children
}

export default RoleBasedRedirect
