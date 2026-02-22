import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations, Language, TranslationSchema } from './translations';

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationSchema;
    /** Helper for strings with placeholders like "Welcome, {{name}}" */
    interpolate: (str: string, vars: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default to browser language or env variable, fallback to 'en'
    const getBrowserLanguage = (): Language => {
        const envLang = import.meta.env.VITE_DEFAULT_LANGUAGE as Language;
        if (envLang === 'fr' || envLang === 'en') return envLang;
        const browserLang = navigator.language.slice(0, 2).toLowerCase();
        return browserLang === 'fr' ? 'fr' : 'en';
    };

    const [language, setLang] = useState<Language>(getBrowserLanguage);

    const setLanguage = useCallback((lang: Language) => {
        setLang(lang);
        document.documentElement.lang = lang;
        localStorage.setItem('vantage_language', lang);
    }, []);

    const interpolate = useCallback((str: string, vars: Record<string, string | number>): string => {
        return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''));
    }, []);

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, interpolate }}>
            {children}
        </LanguageContext.Provider>
    );
};

/** Use this hook in any component to access translations */
export const useLanguage = (): LanguageContextValue => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
    return ctx;
};
