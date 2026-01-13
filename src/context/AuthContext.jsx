import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false) // Unblock UI immediately
            if (session?.user) {
                fetchProfile(session.user.id)
            }
        }).catch(err => {
            console.error('Session check failed', err)
            setLoading(false)
        })

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('Auth state changed:', _event)
            setUser(session?.user ?? null)
            // If we just signed in, loading might be true, so ensure it's false
            setLoading(false)

            if (session?.user) {
                await fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setRole(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            console.log('Fetching profile for:', userId)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.warn('Error fetching profile (RLS?):', error)
                return
            }

            if (data) {
                console.log('Profile loaded:', data.full_name)
                setProfile(data)
                setRole(data.role)
            }
        } catch (error) {
            console.error('Error loading profile logic:', error)
        }
    }

    const signUp = async (email, password, options) => {
        return await supabase.auth.signUp({
            email,
            password,
            options
        })
    }

    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({ email, password })
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setRole(null)
    }

    const value = {
        signUp,
        signIn,
        user,
        profile,
        role,
        loading,
        signOut,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
