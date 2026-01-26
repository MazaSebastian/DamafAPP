import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    const [themeSettings, setThemeSettings] = useState({})
    const [loading, setLoading] = useState(true)

    const fetchThemeSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('*')
                .like('key', 'theme_%')

            if (error) throw error

            if (data) {
                const settings = {}
                data.forEach(item => {
                    settings[item.key] = item.value
                })
                setThemeSettings(settings)
                applyTheme(settings)
            }
        } catch (error) {
            console.error('Error fetching theme settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const applyTheme = (settings) => {
        const root = document.documentElement

        // Map database keys to CSS variables
        if (settings.theme_color_primary) root.style.setProperty('--color-primary', settings.theme_color_primary)
        if (settings.theme_color_secondary) root.style.setProperty('--color-secondary', settings.theme_color_secondary)
        if (settings.theme_color_background) root.style.setProperty('--color-background', settings.theme_color_background)
        if (settings.theme_color_surface) root.style.setProperty('--color-surface', settings.theme_color_surface)
        if (settings.theme_color_text_main) root.style.setProperty('--color-text-main', settings.theme_color_text_main)
        if (settings.theme_color_text_muted) root.style.setProperty('--color-text-muted', settings.theme_color_text_muted)


    }

    // Allow updating theme locally (optimistic) and saving
    const updateThemeSetting = async (key, value) => {
        // 1. Apply locally immediately
        const newSettings = { ...themeSettings, [key]: value }
        setThemeSettings(newSettings)
        applyTheme(newSettings)

        // 2. Persist
        // The implementation in SettingsManager will handle the DB update logic usually, 
        // but if we want this context to be the source of truth, we can expose a refresh function
        // or just let SettingsManager call applyTheme/refresh.
        // For simple flow: SettingsManager updates DB -> Calls refresh here OR we rely on realtime/reload.
        // Let's expect SettingsManager to call a function here to sync if needed, or we just rely on fetch.
    }

    // Listen for changes? Or simple refresh method
    const refreshTheme = () => fetchThemeSettings()

    useEffect(() => {
        fetchThemeSettings()
    }, [])

    return (
        <ThemeContext.Provider value={{ themeSettings, loading, refreshTheme, updateThemeSetting }}>
            {children}
        </ThemeContext.Provider>
    )
}
