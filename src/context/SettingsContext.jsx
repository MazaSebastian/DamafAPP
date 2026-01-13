import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const SettingsContext = createContext()

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({})
    const [loading, setLoading] = useState(true)

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('*')

            if (error) {
                console.error('Error fetching settings:', error)
                return
            }

            // Convert array to object for easier access: { key: value }
            const settingsMap = (data || []).reduce((acc, item) => {
                acc[item.key] = item.value
                return acc
            }, {})

            setSettings(settingsMap)
        } catch (err) {
            console.error('Unexpected error fetching settings:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    // Helper to get a setting with a default value and optional type casting
    const getSetting = (key, defaultValue, type = 'string') => {
        const value = settings[key]
        if (value === undefined || value === null) return defaultValue

        if (type === 'number') {
            const num = Number(value)
            return isNaN(num) ? defaultValue : num
        }

        if (type === 'boolean') {
            return value === 'true'
        }

        return value
    }

    const value = {
        settings,
        getSetting,
        refreshSettings: fetchSettings,
        loading
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}
