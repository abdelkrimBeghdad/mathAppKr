import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
    { code: 'ar', label: 'العربية', dir: 'rtl', flag: '🇩🇿' },
    { code: 'fr', label: 'Français', dir: 'ltr', flag: '🇫🇷' },
    { code: 'en', label: 'English', dir: 'ltr', flag: '🇺🇸' }
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang.code);
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = lang.code;
        setIsOpen(false);
    };

    const currentLang = LANGUAGES.find(l => l.code === (i18n.language || 'ar')) || LANGUAGES[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all group"
            >
                <Languages size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">{currentLang.code}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                            style={{ [document.documentElement.dir === 'rtl' ? 'left' : 'right']: 0 }}
                        >
                            <div className="p-2 space-y-1">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${i18n.language === lang.code
                                                ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-bold'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{lang.flag}</span>
                                            <span className="text-sm font-bold">{lang.label}</span>
                                        </div>
                                        {i18n.language === lang.code && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
