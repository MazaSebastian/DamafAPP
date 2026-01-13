import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from './AuthContext'

const LanguageContext = createContext()

export const translations = {
    es: {
        hello: 'Hola',
        settings: 'Configuración',
        language: 'Idioma',
        save: 'Guardar',
        cancel: 'Cancelar',
        // Add more keys as we migrate UI
    },
    en: {
        hello: 'Hello',
        settings: 'Settings',
        language: 'Language',
        save: 'Save',
        cancel: 'Cancel',
    }
}

export const LanguageProvider = ({ children }) => {
    const { user } = useAuth()
    const [language, setLanguage] = useState('es') // Default Spanish

    useEffect(() => {
        if (user) {
            fetchUserLanguage()
        }
    }, [user])

    const fetchUserLanguage = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('language')
                .eq('id', user.id)
                .single()

            if (data?.language) {
                setLanguage(data.language)
            }
        } catch (error) {
            console.error('Error fetching language:', error)
        }
    }

    const changeLanguage = async (newLang) => {
        setLanguage(newLang)
        if (user) {
            await supabase
                .from('profiles')
                .update({ language: newLang })
                .eq('id', user.id)
        }
    }

    const t = (key) => {
        return translations[language][key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    return useContext(LanguageContext)
}
