import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations, Language, TranslationSchema } from './translations';

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    /** Cycle through languages: en → fr → pcm → en */
    toggleLanguage: () => void;
    t: TranslationSchema;
    interpolate: (template: string, vars: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const stored = localStorage.getItem('amoura_language') as Language | null;
        return stored && ['en', 'fr', 'pcm'].includes(stored) ? stored : 'en';
    });

    const handleSetLanguage = useCallback((lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('amoura_language', lang);
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => {
            const next: Language = prev === 'en' ? 'fr' : prev === 'fr' ? 'pcm' : 'en';
            localStorage.setItem('amoura_language', next);
            return next;
        });
    }, []);

    const interpolate = useCallback(
        (template: string, vars: Record<string, string | number>): string =>
            Object.entries(vars).reduce(
                (acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, 'g'), String(v)),
                template,
            ),
        [],
    );

    const t = translations[language] as unknown as TranslationSchema;

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, toggleLanguage, t, interpolate }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
};
