import { createContext, useContext } from 'react';

export const LabThemeContext = createContext(null);
export const useLabTheme = () => {
    const context = useContext(LabThemeContext);
    if (!context) {
        return {
            theme: {
                container: 'bg-[#050510] text-white border-white/5 shadow-2xl',
                card: 'bg-white/5 backdrop-blur-3xl border-white/10 shadow-2xl',
                textMain: 'text-white',
                textSub: 'text-slate-400'
            },
            isDarkMode: true,
            accentColor: 'indigo',
            currentAccent: {
                badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                gradient: 'from-indigo-600/20',
                glow: 'shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]',
                text: 'text-indigo-400'
            }
        };
    }
    return context;
};
