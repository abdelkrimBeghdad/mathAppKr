import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, RotateCcw, Activity, Zap, Beaker } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';

const PythVisualProofContent = ({ isDarkMode }) => {
    const { theme } = useLabTheme();
    const [phase, setPhase] = useState('intro');
    const [isProofActive, setIsProofActive] = useState(false);
    const [reward, setReward] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval;
        if (isProofActive && progress < 100) {
            interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 1, 100));
            }, 30);
        }
        if (progress === 100 && !reward) {
             confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
        return () => clearInterval(interval);
    }, [isProofActive, progress, reward]);

    const resetLab = () => {
        setPhase('intro');
        setIsProofActive(false);
        setProgress(0);
        setReward(null);
    };

    return (
        <LabShell
            isDarkMode={isDarkMode}
            labId="pyth-visual"
            accentColor="rose"
            badgeText="مختبر البرهان المائي v2.0"
            badgeIcon={Beaker}
            title={phase === 'intro' ? "برهان فيثاغورس البصري" : "محاكاة التدفق الرياضي"}
            phase={phase}
            onBack={resetLab}
        >
            <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center max-w-2xl w-full px-4">
                            <div className={`p-4 md:p-6 rounded-[1.5rem] border backdrop-blur-3xl ${theme.card} relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
                                <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-rose-700 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-2xl shadow-rose-500/40 relative z-10">
                                    <Droplets size={20} className="animate-bounce" />
                                </div>
                                <p className="text-base md:text-lg font-medium mb-4 leading-relaxed">
                                    لماذا <span className="text-rose-400 font-black italic">BC² = AB² + AC²</span>؟
                                    <br/>
                                    <span className="text-sm opacity-60">بدلاً من حفظ المعادلات، شاهد كيف تتدفق المساحات لتثبت الحقيقة الرياضية.</span>
                                </p>
                                <button onClick={() => setPhase('learn')} className="group relative px-12 py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-rose-600/20 active:scale-95 overflow-hidden">
                                    <span className="relative z-10">دخول المختبر</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 md:gap-4 min-h-0 px-4">
                            <div className="relative w-full max-w-[600px] flex-1 min-h-0 flex items-center justify-center">
                                <svg viewBox="0 0 600 650" className="w-full h-full max-h-[100%] drop-shadow-2xl overflow-visible">
                                    <defs>
                                        <linearGradient id="liquid-main" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
                                        </linearGradient>
                                        <filter id="subtle-glow">
                                            <feGaussianBlur stdDeviation="2" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>

                                    <g transform="translate(200, 220)">
                                        <rect x="-100" y="0" width="100" height="100" rx="4" fill={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(15, 23, 42, 0.05)"} stroke={isDarkMode ? "#64748b" : "#475569"} strokeWidth="2.5" />
                                        <rect x="0" y="100" width="150" height="150" rx="4" fill={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(15, 23, 42, 0.05)"} stroke={isDarkMode ? "#64748b" : "#475569"} strokeWidth="2.5" />
                                        
                                        <g transform="rotate(33.7, 0, 0)">
                                            <rect x="0" y="-180" width="180" height="180" rx="4" fill={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(15, 23, 42, 0.05)"} stroke={isDarkMode ? "#64748b" : "#475569"} strokeWidth="2.5" />
                                            <rect x="0" y={- (progress / 100) * 180} width="180" height={(progress / 100) * 180} fill="url(#liquid-main)" filter="url(#subtle-glow)" rx="1" />
                                        </g>

                                        <rect x="-100" y={(progress / 100) * 100} width="100" height={100 - (progress / 100) * 100} fill="url(#liquid-main)" filter="url(#subtle-glow)" rx="1" />
                                        <rect x="0" y={100 + (progress / 100) * 150} width="150" height={150 - (progress / 100) * 150} fill="url(#liquid-main)" filter="url(#subtle-glow)" rx="1" />

                                        <path d="M 0 0 L 0 100 L 150 100 Z" fill={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.03)"} stroke={isDarkMode ? "white" : "#1e293b"} strokeWidth="3" strokeLinejoin="round" />
                                        <path d="M 0 88 L 12 88 L 12 100" fill="none" stroke={isDarkMode ? "white" : "#1e293b"} strokeWidth="2" />

                                        <text x="-35" y="125" fill={isDarkMode ? "#e2e8f0" : "#334155"} fontSize="24" fontWeight="800">A</text>
                                        <text x="-35" y="-15" fill={isDarkMode ? "#e2e8f0" : "#334155"} fontSize="24" fontWeight="800">B</text>
                                        <text x="165" y="125" fill={isDarkMode ? "#e2e8f0" : "#334155"} fontSize="24" fontWeight="800">C</text>

                                        <g transform="translate(-130, 45)">
                                            <text x="0" y="0" fill={isDarkMode ? "#94a3b8" : "#475569"} fontSize="18" fontWeight="800">AB²</text>
                                            <text x="0" y="22" fill={isDarkMode ? "#cbd5e1" : "#64748b"} fontSize="13">{Math.round(100 * (1 - progress/100))} وحدة</text>
                                        </g>
                                        <g transform="translate(50, 275)">
                                            <text x="0" y="0" fill={isDarkMode ? "#94a3b8" : "#475569"} fontSize="18" fontWeight="800">AC²</text>
                                            <text x="0" y="22" fill={isDarkMode ? "#cbd5e1" : "#64748b"} fontSize="13">{Math.round(225 * (1 - progress/100))} وحدة</text>
                                        </g>
                                        <g transform="translate(130, -70)">
                                            <text x="0" y="0" fill="#2563eb" fontSize="20" fontWeight="900">BC²</text>
                                            <text x="0" y="22" fill="#2563eb" fontSize="15" fontWeight="bold">{Math.round(325 * (progress/100))} وحدة</text>
                                        </g>
                                    </g>
                                </svg>

                                {!isProofActive && (
                                    <motion.button 
                                        whileHover={{ scale: 1.1, rotate: 5 }} whileActive={{ scale: 0.9 }}
                                        onClick={() => setIsProofActive(true)}
                                        className="absolute z-30 w-24 h-24 bg-rose-600 text-white rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.5)] border-4 border-white/30 backdrop-blur-md"
                                    >
                                        <Zap size={20} className="mb-1" />
                                        <span className="text-[10px] font-black uppercase">ابدأ</span>
                                    </motion.button>
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                {progress < 100 ? (
                                    <motion.div key="controls" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`w-full max-w-md p-6 rounded-3xl border backdrop-blur-2xl ${theme.card} flex flex-col gap-4 shadow-2xl`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Activity size={18} className="text-rose-500" />
                                                <span className="font-black text-sm uppercase tracking-widest">حالة النظام</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${isProofActive ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-rose-500/20 text-rose-400'}`}>
                                                {isProofActive ? 'محاكاة جارية' : 'جاهز للتشغيل'}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div className="h-full bg-gradient-to-r from-rose-500 to-cyan-500" animate={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                                                <span className="block text-[10px] opacity-50 uppercase font-black">النسبة</span>
                                                <span className="text-xl font-black text-rose-400">{progress}%</span>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                                                <span className="block text-[10px] opacity-50 uppercase font-black">التحقق</span>
                                                <span className="text-xl font-black text-emerald-400">{progress === 100 ? 'تم بنجاح' : 'جاري...'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="conclusion" initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className={`absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xl p-8 rounded-3xl border backdrop-blur-2xl ${isDarkMode ? 'bg-slate-900/90 border-indigo-500/30' : 'bg-white/95 border-indigo-200'} shadow-[0_20px_60px_rgba(0,0,0,0.3)] text-center`}>
                                        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                                            <span className="text-xl">💡</span>
                                        </div>
                                        <h3 className={`text-base md:text-lg font-black mb-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>الاستنتاج الرياضي</h3>
                                        <p className={`text-lg mb-3 leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            كما تلاحظ، السائل الذي كان يملأ المربعين الصغيرين (<span className="font-bold text-slate-500">AB²</span> و <span className="font-bold text-slate-500">AC²</span>) قد ملأ المربع الكبير (<span className="font-bold text-blue-600">BC²</span>) بالكامل دون زيادة أو نقصان.
                                        </p>
                                        <div className={`py-5 rounded-2xl border ${isDarkMode ? 'bg-black/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <span className={`text-base md:text-lg font-black font-serif tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                <span className="text-slate-500">AB²</span> + <span className="text-slate-500">AC²</span> = <span className="text-blue-600">BC²</span>
                                            </span>
                                        </div>
                                        <button onClick={resetLab} className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 mx-auto">
                                            <RotateCcw size={18} /> إعادة التجربة
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </LabShell>
    );
};

export default function PythVisualProofLab(props) {
    return <PythVisualProofContent {...props} />;
}
