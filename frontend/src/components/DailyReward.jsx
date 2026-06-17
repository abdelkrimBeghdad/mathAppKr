import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Coins, X, Sparkles, Star } from 'lucide-react';
import api from '../api/axios';
import confetti from 'canvas-confetti';
import useAuthStore from '../store/useAuthStore';

export default function DailyReward() {
    const [status, setStatus] = useState(null);
    const [reward, setReward] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const { isDark } = useTheme();
    const addCoins = useAuthStore(state => state.addCoins);


    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { data } = await api.get('/rewards/daily/status');
                if (data.can_claim) {
                    setStatus(data);
                    setIsOpen(true);
                }
            } catch (e) {
                console.error('Failed to check daily reward status', e);
            }
        };

        // Delay check to let the app load
        const timer = setTimeout(checkStatus, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleClaim = async () => {
        setClaiming(true);
        try {
            const { data } = await api.post('/rewards/daily/claim');
            setReward(data);
            addCoins(data.amount); // Update global Zustand store!

            // Celebration!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#f59e0b', '#10b981']
            });
        } catch (e) {
            console.error('Failed to claim reward', e);
        } finally {
            setClaiming(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => !reward && setIsOpen(false)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={`relative w-full max-w-sm rounded-[2.5rem] p-8 overflow-hidden shadow-2xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                        } border-2`}
                >
                    {/* Top decoration */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent" />

                    {!reward ? (
                        <div className="relative z-10 text-center space-y-6">
                            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl"
                                />
                                <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-5 shadow-xl shadow-amber-500/30">
                                    <Gift size={48} className="text-white" />
                                </div>
                            </div>

                            <div>
                                <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                    مكافأة اليوم! 🎁
                                </h2>
                                <p className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    أهلاً بك مجدداً. بطلنا النشط يزداد قوة يوماً بعد يوم!
                                </p>
                            </div>

                            <button
                                onClick={handleClaim}
                                disabled={claiming}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-500/30 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
                            >
                                {claiming ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                ) : (
                                    'فتح الصندوق'
                                )}
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className={`text-sm font-bold ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                                ليس الآن
                            </button>
                        </div>
                    ) : (
                        <div className="relative z-10 text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12 }}
                                className="relative mx-auto w-32 h-32 flex items-center justify-center"
                            >
                                <Sparkles className="absolute text-amber-400 animate-pulse" size={64} />
                                <div className="text-7xl font-black text-amber-500 drop-shadow-lg">
                                    <Coins size={80} className="fill-amber-400 text-amber-600" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <p className="text-amber-500 font-black text-xl mb-1">لقد حصلت على</p>
                                <h2 className={`text-5xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    +{reward.amount}
                                </h2>
                                <p className={`text-lg font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>قطعة ذهبية</p>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1"
                            >
                                رائع!
                            </motion.button>
                        </div>
                    )}

                    {/* Fun decorative particles */}
                    <div className="absolute top-4 left-4 text-emerald-500/20"><Star size={20} /></div>
                    <div className="absolute bottom-10 right-4 text-sky-500/20"><Sparkles size={24} /></div>
                    <div className="absolute top-20 right-10 text-amber-500/20 rotate-45"><Gift size={16} /></div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
