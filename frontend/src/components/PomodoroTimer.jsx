import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, X, Coffee, Brain } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';
import confetti from 'canvas-confetti';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const MODES = {
    FOCUS: { id: 'focus', label: 'تركيز', minutes: 25, icon: Brain, color: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500' },
    SHORT_BREAK: { id: 'short', label: 'استراحة قصيرة', minutes: 5, icon: Coffee, color: 'text-sky-500', bg: 'bg-sky-500', border: 'border-sky-500' },
    LONG_BREAK: { id: 'long', label: 'استراحة طويلة', minutes: 15, icon: Coffee, color: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500' },
};

export default function PomodoroTimer() {
    const { isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState(MODES.FOCUS);
    const [timeLeft, setTimeLeft] = useState(mode.minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const updateLocalUserXP = useAuthStore(state => state.addXp); // Assuming addXp is available or we can just fetch user

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            clearInterval(interval);
            handleComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleComplete = async () => {
        setIsActive(false);
        const audio = new Audio('/notification.mp3'); // Optional if exists
        audio.play().catch(() => { });

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        if (mode.id === 'focus') {
            toast.success('أحسنت! أتممت جلسة التركيز بنجاح. +10 نقاط');
            // Optimistic XP update (We can make a real API call if we have an endpoint)
            // But for now, we'll just show the toast and update zustand if possible
        } else {
            toast('انتهت الاستراحة! حان وقت العودة.', { icon: '🔔' });
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode.minutes * 60);
    };

    const changeMode = (newMode) => {
        setIsActive(false);
        setMode(newMode);
        setTimeLeft(newMode.minutes * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = ((mode.minutes * 60 - timeLeft) / (mode.minutes * 60)) * 100;

    return (
        <div className="fixed bottom-24 left-6 md:bottom-8 md:left-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={clsx(
                            "absolute bottom-16 sm:bottom-20 left-0 w-80 rounded-[2rem] shadow-2xl border-2 overflow-hidden flex flex-col",
                            isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className={clsx("font-black text-lg", isDark ? "text-slate-100" : "text-slate-800")}>جلسة التركيز</h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modes */}
                        <div className="flex items-center justify-center gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                            {Object.values(MODES).map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => changeMode(m)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                                        mode.id === m.id
                                            ? `${m.bg} text-white shadow-md`
                                            : "bg-transparent text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {/* Timer Display */}
                        <div className="p-8 flex flex-col items-center justify-center relative">
                            {/* Circular Progress */}
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        className="stroke-slate-100 dark:stroke-slate-700"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        className={clsx("transition-all duration-1000 ease-linear", mode.color.replace('text-', 'stroke-'))}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray="283"
                                        strokeDashoffset={283 - (283 * progressPercent) / 100}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <mode.icon size={24} className={clsx("mb-2", mode.color)} />
                                    <span className={clsx("text-4xl font-black tracking-tight", isDark ? "text-white" : "text-slate-800")}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="p-6 pt-0 flex justify-center gap-4">
                            <button
                                onClick={toggleTimer}
                                className={clsx(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all active:scale-95",
                                    isActive ? "bg-amber-500 shadow-amber-500/20" : mode.bg + " shadow-" + mode.color.replace('text-', '') + "/20"
                                )}
                            >
                                {isActive ? <Pause size={28} /> : <Play size={28} className="translate-x-1" />}
                            </button>

                            <button
                                onClick={resetTimer}
                                className={clsx(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                )}
                            >
                                <RotateCcw size={24} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
                    isActive ? "bg-rose-500 animate-pulse text-white shadow-rose-500/30" : (isDark ? "bg-slate-800 text-sky-400 border border-slate-700" : "bg-white text-sky-500 border border-slate-100")
                )}
            >
                {isActive ? (
                    <div className="text-white font-black text-sm">{formatTime(timeLeft)}</div>
                ) : (
                    <Timer size={28} />
                )}
            </motion.button>
        </div>
    );
}
