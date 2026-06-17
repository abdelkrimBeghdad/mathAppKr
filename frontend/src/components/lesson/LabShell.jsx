import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { labProgressService } from '../../utils/labProgressService';
import { LabThemeContext } from './LabThemeContext';
import { useTheme } from '../../context/ThemeContext';

const LabShell = ({ 
  children, 
  isDarkMode: propIsDarkMode, 
  accentColor = 'indigo', 
  badgeText, 
  badgeIcon: BadgeIcon, 
  title, 
  onBack,
  phase, 
  labId, 
  customHeader = null,
  containerClassName = ""
}) => {
  const globalTheme = useTheme();
  const isDarkMode = (propIsDarkMode !== undefined && propIsDarkMode !== null)
    ? propIsDarkMode
    : (globalTheme && globalTheme.isDark !== undefined ? globalTheme.isDark : true);

  const theme = {
    container: isDarkMode ? 'bg-[#050510] text-white border-white/5 shadow-2xl' : 'bg-[#f8faff] text-slate-900 border-slate-200 shadow-2xl',
    card: isDarkMode ? 'bg-white/5 backdrop-blur-3xl border-white/10 shadow-2xl' : 'bg-white border-slate-200 shadow-xl',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    accent: accentColor
  };

  useEffect(() => {
    if (labId && phase) {
      labProgressService.update(labId, phase).catch(err => console.error('Failed to update lab progress', err));
    }
  }, [labId, phase]);

  const accentStyles = {
    indigo: {
      badge: isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm',
      gradient: 'from-indigo-600/20',
      glow: 'shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]',
      text: 'text-indigo-400'
    },
    rose: {
      badge: isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm',
      gradient: 'from-rose-600/20',
      glow: 'shadow-[0_0_50px_-12px_rgba(244,63,94,0.3)]',
      text: 'text-rose-400'
    },
    emerald: {
      badge: isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm',
      gradient: 'from-emerald-600/20',
      glow: 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]',
      text: 'text-emerald-400'
    },
    fuchsia: {
      badge: isDarkMode ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' : 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100 shadow-sm',
      gradient: 'from-fuchsia-600/20',
      glow: 'shadow-[0_0_50px_-12px_rgba(192,38,211,0.3)]',
      text: 'text-fuchsia-400'
    },
    violet: {
      badge: isDarkMode ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-violet-50 text-violet-600 border-violet-100 shadow-sm',
      gradient: 'from-violet-600/20',
      glow: 'shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]',
      text: 'text-violet-400'
    },
    amber: {
        badge: isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm',
        gradient: 'from-amber-600/20',
        glow: 'shadow-[0_0_50px_-12px_rgba(245,158,11,0.3)]',
        text: 'text-amber-400'
    }
  };

  const currentAccent = accentStyles[accentColor] || accentStyles.indigo;

  return (
    <LabThemeContext.Provider value={{ theme, isDarkMode, accentColor, currentAccent }}>
      <div className={`w-full h-full min-h-[350px] max-h-[88vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-3 md:p-5 relative overflow-hidden flex flex-col font-sans border transition-all duration-700 ${containerClassName} ${currentAccent.glow}`} dir="rtl">
        {/* Background Decorative Elements */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse`} />
          <div className={`absolute -bottom-24 -left-24 w-96 h-96 bg-${accentColor}-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse`} style={{ animationDelay: '1s' }} />
          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${currentAccent.gradient} via-transparent to-transparent pointer-events-none`} />
        </div>

        {/* Header Section */}
        <div className="text-center z-10 mb-2 pt-1">
          <AnimatePresence mode="wait">
            {customHeader ? customHeader : (
              <motion.div 
                key={phase === 'intro' ? 'intro-header' : 'lab-header'} 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col items-center"
              >
                {badgeText && (
                  <div className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest mb-1.5 border backdrop-blur-xl ${currentAccent.badge}`}>
                    {BadgeIcon && <BadgeIcon size={14} />} {badgeText}
                  </div>
                )}
                <h2 className={`text-xs md:text-sm lg:text-xl font-black leading-tight tracking-tighter ${theme.textMain} drop-shadow-sm`}>
                  {title}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lab Content */}
        <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full min-h-0 overflow-y-auto no-scrollbar">
          {children}
        </div>

        {/* Inner Back Button */}
        {phase !== 'intro' && onBack && (
          <div className="absolute top-4 right-4 z-30">
            <button 
              onClick={onBack} 
              title="رجوع للخلف"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl backdrop-blur-2xl border transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-600 shadow-md hover:bg-slate-50'}`}
            >
              <ChevronRight size={18} />
              <span className="text-xs font-bold font-cairo">رجوع</span>
            </button>
          </div>
        )}
      </div>
    </LabThemeContext.Provider>
  );
};

export default LabShell;
