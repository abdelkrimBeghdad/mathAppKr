import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Star, AlertTriangle, ShieldAlert, ArrowUpCircle, Flame } from 'lucide-react';

export default function ProgressiveChallengeUI({ mastery, themeColor = 'emerald', isDarkMode = true }) {
    const { level, streak, mistakes, isMastered, statusText, progressPercentage, config } = mastery;

    // Adapt colors for light/dark mode
    const levelColors = {
        1: { 
            border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200', 
            text: isDarkMode ? 'text-blue-400' : 'text-blue-600', 
            bg: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50', 
            icon: <Target size={14} /> 
        },
        2: { 
            border: isDarkMode ? 'border-amber-500/30' : 'border-amber-200', 
            text: isDarkMode ? 'text-amber-400' : 'text-amber-600', 
            bg: isDarkMode ? 'bg-amber-500/20' : 'bg-amber-50', 
            icon: <Flame size={14} /> 
        },
        3: { 
            border: isDarkMode ? `border-${themeColor}-500/30` : `border-${themeColor}-200`, 
            text: isDarkMode ? `text-${themeColor}-400` : `text-${themeColor}-600`, 
            bg: isDarkMode ? `bg-${themeColor}-500/20` : `bg-${themeColor}-50`, 
            icon: <Star size={14} /> 
        }
    };

    const curStyle = levelColors[level] || levelColors[1];

    useEffect(() => {}, [statusText]);

    return (
        <div className="w-full flex flex-wrap items-center justify-center gap-3 mb-2 mt-0 z-50">
            {/* Level Badge */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md shadow-sm ${curStyle.bg} ${curStyle.border} transition-all duration-500`}>
                <div className={`flex items-center gap-1.5 font-black text-xs uppercase tracking-widest ${curStyle.text}`}>
                    {curStyle.icon}
                    <span>المستوى {level}</span>
                </div>
            </div>

            {/* Streak Stars */}
            <div className="flex items-center gap-1 bg-white/50 dark:bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 dark:border-white/5 shadow-sm">
                {[...Array(config.streakToPass)].map((_, i) => (
                    <motion.div 
                        key={i}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ 
                            scale: i < streak ? 1.2 : 1, 
                            opacity: i < streak ? 1 : 0.4,
                            rotate: i < streak ? [0, 15, -15, 0] : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className={`${i < streak ? 'text-amber-400 drop-shadow-glow-amber' : (isDarkMode ? 'text-slate-600' : 'text-slate-300')} transition-all duration-300`}
                    >
                        <Star size={16} fill={i < streak ? "currentColor" : "none"} weight="fill" />
                    </motion.div>
                ))}
            </div>

            {/* Warning / Alerts */}
            <AnimatePresence>
                {mistakes > 0 && level > 1 && statusText !== 'LEVEL_DROP' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-black backdrop-blur-md"
                    >
                        <AlertTriangle size={14} /> انتبه! خطأ للنزول
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toast Alerts for Level changes */}
            <AnimatePresence>
                {statusText === 'LEVEL_DROP' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-rose-500 text-white px-6 py-2 rounded-full font-black text-sm shadow-glow-rose z-[100]"
                    >
                        <ShieldAlert size={18} /> تراجع في التركيز! عدنا للمستوى السابق
                    </motion.div>
                )}
                {statusText === 'LEVEL_UP' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-sm shadow-glow-emerald z-[100]"
                    >
                        <ArrowUpCircle size={18} /> ممتاز! ارتقيت للمستوى التالي
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
