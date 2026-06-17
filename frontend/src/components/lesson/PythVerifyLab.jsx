import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Triangle, Target, BookOpen, ArrowRight, Zap, Binary } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function PythVerifyLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0);
    const [problem, setProblem] = useState({ a: 3, b: 4, c: 5, isRight: true });
    const [answer, setAnswer] = useState(null);
    const [error, setError] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        { title: 'متى يكون المثلث قائماً؟', detail: 'المثلث قائم إذا وفقط إذا كان مربع أطول ضلع يساوي مجموع مربعي الضلعين الآخرين.', math: 'AC² = AB² + BC² ؟' },
        { title: 'خطوات التحقق', detail: '1. حدد أطول ضلع (AC). 2. احسب AC² ثم AB² + BC². 3. قارن: إذا تساويا → قائم، وإلا → ليس قائماً.', math: 'AC² = AB² + BC² → 25 = 25 ✓' }
    ];

    const problems = [
        { a: 3, b: 4, c: 5, isRight: true }, { a: 5, b: 12, c: 13, isRight: true },
        { a: 8, b: 15, c: 17, isRight: true }, { a: 3, b: 5, c: 7, isRight: false },
        { a: 4, b: 6, c: 8, isRight: false }, { a: 7, b: 24, c: 25, isRight: true },
        { a: 2, b: 3, c: 4, isRight: false }, { a: 6, b: 8, c: 10, isRight: true }
    ];

    const generateProblem = () => {
        const p = problems[Math.floor(Math.random() * problems.length)];
        setProblem(p); setPhase('practice'); setStep(0); setAnswer(null); setError(false); setReward(null);
    };

    const handleAnswer = (userAnswer) => {
        if (userAnswer === problem.isRight) {
            setAnswer(userAnswer); setStep(1);
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            rewardService.claimLabReward('pyth-verify').then(d => d.status === 'success' && setReward(d)).catch(console.error);
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm'}`}>
                                <Triangle size={14} /> التحقق من مثلث قائم
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>هل المثلث قائم الزاوية؟</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                <Target size={14} /> {step === 0 ? 'تحقق من الخاصية' : 'تم التحقق'}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {step === 1 ? 'إجابة صحيحة!' : `الأضلاع: AB=${problem.a}, BC=${problem.b}, AC=${problem.c}`}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                            <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>شرط المثلث القائم:</h3>
                            <div className={`p-3 rounded-xl border text-center ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <div className={`text-base md:text-lg font-black font-mono ${theme.textMain}`} dir="ltr">
                                    AC² = AB² + BC² <span className="text-rose-400">?</span>
                                </div>
                            </div>
                            <p className={`mt-3 text-sm ${theme.textSub}`}>إذا تحقق الشرط → المثلث قائم</p>
                            <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">تعلّم الطريقة</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1rem] shadow-2xl">
                            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-rose-600 to-pink-900' : 'bg-gradient-to-br from-rose-500 to-rose-600'}`} />
                            <div className="relative p-8 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Triangle size={20} className="animate-pulse text-rose-200" />
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
                                <p className={`text-sm md:text-base ${theme.textSub} mb-3 max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                                <div className="p-6 rounded-2xl border-2 border-rose-500/30 bg-black/40 w-full">
                                    <span className="text-sm md:text-base font-mono font-black text-rose-400" dir="ltr">{learnPages[learnStep].math}</span>
                                </div>
                            </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                            <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                            {learnStep < 1 ? (
                                <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-lg">التالي</button>
                            ) : (
                                <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-lg">ابدأ التحقق</button>
                            )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-4xl px-2">
                        <div className={`w-full p-3 md:p-4 rounded-[1rem] border backdrop-blur-3xl mb-2 text-center ${step === 1 ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                            {/* Triangle SVG */}
                            <div className="flex justify-center mb-2">
                                <svg width="150" height="105" viewBox="0 0 200 140" className="drop-shadow-glow-rose">
                                    <path d="M40 120 L40 30 L160 120 Z" fill="none" stroke={isDarkMode ? '#f43f5e' : '#e11d48'} strokeWidth="3" strokeLinejoin="round" />
                                    <path d="M40 105 L55 105 L55 120" fill="none" stroke={isDarkMode ? '#f43f5e' : '#e11d48'} strokeWidth="2" />
                                    <text x="25" y="25" fontSize="14" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>A</text>
                                    <text x="25" y="135" fontSize="14" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>B</text>
                                    <text x="165" y="135" fontSize="14" fontWeight="bold" fill={isDarkMode ? '#fff' : '#1e293b'}>C</text>
                                    <text x="15" y="80" fontSize="12" fill={isDarkMode ? '#94a3b8' : '#64748b'} fontWeight="bold">AB={problem.a}</text>
                                    <text x="90" y="138" fontSize="12" fill={isDarkMode ? '#94a3b8' : '#64748b'} fontWeight="bold">BC={problem.b}</text>
                                    <text x="110" y="65" fontSize="13" fill="#fbbf24" fontWeight="bold">AC={problem.c}</text>
                                </svg>
                            </div>
                            {/* Calculation display */}
                            <div className={`p-2 md:p-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} mb-2 font-mono text-base md:text-lg ${theme.textMain}`} dir="ltr">
                                <div>AC² = {problem.c * problem.c}</div>
                                <div>AB² + BC² = {problem.a * problem.a} + {problem.b * problem.b} = {problem.a * problem.a + problem.b * problem.b}</div>
                                <div className="mt-1 font-black text-rose-400">
                                    {problem.c * problem.c} {problem.c * problem.c === problem.a * problem.a + problem.b * problem.b ? '=' : '≠'} {problem.a * problem.a + problem.b * problem.b}
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {step === 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-2xl">
                                    <p className={`mb-4 font-bold text-lg ${theme.textMain}`}>هل هذا المثلث قائم الزاوية؟</p>
                                    <div className="flex gap-4 justify-center">
                                        <button onClick={() => handleAnswer(true)} className={`flex-1 py-3 md:py-2 rounded-xl font-black text-sm md:text-base transition-all ${error ? 'animate-shake' : ''} bg-emerald-600 hover:bg-emerald-500 text-white`}>
                                            ✓ نعم، قائم
                                        </button>
                                        <button onClick={() => handleAnswer(false)} className={`flex-1 py-3 md:py-2 rounded-xl font-black text-sm md:text-base transition-all ${error ? 'animate-shake' : ''} bg-rose-600 hover:bg-rose-500 text-white`}>
                                            ✗ لا، ليس قائماً
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-2xl">
                                    <MasteryRewardCard reward={reward} />
                                    <button onClick={generateProblem} className="mt-2 w-full py-2 md:py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-lg">تحدي جديد</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {phase !== 'intro' && step === 0 && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-rose-400" /> الرجوع
                    </button>
                </div>
            )}
        </div>
    );
}
