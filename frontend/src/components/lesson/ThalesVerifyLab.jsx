import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Triangle, Target, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function ThalesVerifyLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0);
    const [problem, setProblem] = useState({ ad: 2, ab: 6, ae: 3, ac: 9, isParallel: true });
    const [answer, setAnswer] = useState(null);
    const [error, setError] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        { title: 'هل المستقيمان متوازيان؟', detail: 'للتحقق من توازي مستقيمين في شكل طاليس (الخاصية العكسية)، نحسب النسبتين AD/AB و AE/AC ونقارنهما.', math: 'AD/AB = AE/AC ؟' },
        { title: 'خطوات التحقق', detail: '1. احسب النسبة الأولى (الصغير على الكبير في جهة).\n2. احسب النسبة الثانية (في الجهة الأخرى).\n3. إذا تساوتا → المستقيمان متوازيان.', math: '2/6 = 3/9 → 0.33 = 0.33 ✓' }
    ];

    const problems = [
        { ad: 2, ab: 6, ae: 3, ac: 9, isParallel: true }, { ad: 4, ab: 10, ae: 6, ac: 15, isParallel: true },
        { ad: 3, ab: 5, ae: 6, ac: 10, isParallel: true }, { ad: 2, ab: 5, ae: 3, ac: 8, isParallel: false },
        { ad: 5, ab: 15, ae: 4, ac: 12, isParallel: true }, { ad: 3, ab: 7, ae: 4, ac: 9, isParallel: false }
    ];

    const generateProblem = () => {
        const p = problems[Math.floor(Math.random() * problems.length)];
        setProblem(p); setPhase('practice'); setStep(0); setAnswer(null); setError(false); setReward(null);
    };

    const handleAnswer = (userAnswer) => {
        if (userAnswer === problem.isParallel) {
            setAnswer(userAnswer); setStep(1);
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            rewardService.claimLabReward('thales-verify').then(d => d.status === 'success' && setReward(d)).catch(console.error);
        } else { setError(true); setTimeout(() => setError(false), 800); }
    };

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5 shadow-3xl' : 'bg-white border-slate-100 shadow-2xl',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-100 shadow-xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    };

    return (
        <div className={`w-full h-full min-h-[300px] max-h-[85vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-4 relative overflow-hidden flex flex-col font-sans border transition-all duration-500`} dir="rtl">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm'}`}>
                                <Triangle size={14} /> نظرية طاليس العكسية
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>التحقق من التوازي</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                <Target size={14} /> {step === 0 ? 'قارن النسبتين' : 'تم التحقق'}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {step === 1 ? 'إجابة صحيحة!' : `AD=${problem.ad}, AB=${problem.ab} و AE=${problem.ae}, AC=${problem.ac}`}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                            <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>شرط التوازي:</h3>
                            <div className={`p-3 rounded-xl border text-center ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <div className={`text-base md:text-lg font-black font-mono ${theme.textMain}`} dir="ltr">
                                    AD/AB = AE/AC <span className="text-blue-400">?</span>
                                </div>
                            </div>
                            <p className={`mt-3 text-sm ${theme.textSub}`}>إذا تساوت النسبتان → المستقيمان متوازيان (DE // BC)</p>
                            <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">كيف أتحقق؟</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1rem] shadow-2xl">
                            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-indigo-900' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`} />
                            <div className="relative p-8 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Triangle size={20} className="animate-pulse text-blue-200" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase">ابدأ التحقق</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl ${theme.card}`}>
                            <div className="flex flex-col items-center text-center">
                                <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed whitespace-pre-line`}>{learnPages[learnStep].detail}</p>
                                <div className="p-6 rounded-2xl border-2 border-blue-500/30 bg-black/40 w-full">
                                    <span className="text-sm md:text-base font-mono font-black text-blue-400" dir="ltr">{learnPages[learnStep].math}</span>
                                </div>
                            </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                            <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                            {learnStep < 1 ? (
                                <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black text-lg">التالي</button>
                            ) : (
                                <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-lg">ابدأ التحقق</button>
                            )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-4xl px-2">
                        <div className={`w-full p-3 md:p-4 rounded-[1rem] border backdrop-blur-3xl mb-2 text-center ${step === 1 ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                            <div className="flex justify-center mb-2">
                                <svg width="150" height="112" viewBox="0 0 200 150" className="drop-shadow-glow-blue">
                                    <path d="M100 20 L20 140 L180 140 Z" fill="none" stroke={isDarkMode ? '#64748b' : '#94a3b8'} strokeWidth="2" />
                                    <line x1="60" y1="80" x2="140" y2="80" stroke={isDarkMode ? '#3b82f6' : '#2563eb'} strokeWidth="3" />
                                    <text x="95" y="15" fontSize="12" fontWeight="bold" fill={theme.textMain}>A</text>
                                    <text x="10" y="145" fontSize="12" fontWeight="bold" fill={theme.textMain}>B</text>
                                    <text x="180" y="145" fontSize="12" fontWeight="bold" fill={theme.textMain}>C</text>
                                    <text x="50" y="85" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#60a5fa' : '#3b82f6'}>D</text>
                                    <text x="145" y="85" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#60a5fa' : '#3b82f6'}>E</text>
                                </svg>
                            </div>
                            <div className={`p-2 md:p-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} mb-2 font-mono text-base md:text-lg ${theme.textMain}`} dir="ltr">
                                <div>AD/AB = {problem.ad}/{problem.ab} = {(problem.ad / problem.ab).toFixed(2)}</div>
                                <div>AE/AC = {problem.ae}/{problem.ac} = {(problem.ae / problem.ac).toFixed(2)}</div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {step === 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-2xl">
                                    <p className={`mb-4 font-bold text-lg ${theme.textMain}`}>هل المستقيمان (DE) و (BC) متوازيان؟</p>
                                    <div className="flex gap-4 justify-center">
                                        <button onClick={() => handleAnswer(true)} className={`flex-1 py-3 md:py-2 rounded-xl font-black text-sm md:text-base transition-all ${error ? 'animate-shake' : ''} bg-emerald-600 hover:bg-emerald-500 text-white`}>
                                            ✓ نعم، متوازيان
                                        </button>
                                        <button onClick={() => handleAnswer(false)} className={`flex-1 py-3 md:py-2 rounded-xl font-black text-sm md:text-base transition-all ${error ? 'animate-shake' : ''} bg-rose-600 hover:bg-rose-500 text-white`}>
                                            ✗ لا، غير متوازيين
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-2xl">
                                    <MasteryRewardCard reward={reward} />
                                    <button onClick={generateProblem} className="mt-2 w-full py-2 md:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg">تحدي جديد</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {phase !== 'intro' && step === 0 && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-blue-400" /> الرجوع
                    </button>
                </div>
            )}
        </div>
    );
}
