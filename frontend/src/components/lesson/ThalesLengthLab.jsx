import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Triangle, Target, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function ThalesLengthLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0);
    const [problem, setProblem] = useState({ ad: 2, ab: 6, ae: 3, missing: 'ac', ans: 9 });
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        { title: 'حساب طول مجهول', detail: 'تسمح نظرية طاليس (الخاصية المباشرة) بحساب طول ضلع مجهول في مثلث إذا علمنا أن هناك مستقيمين متوازيين.', math: 'AD/AB = AE/AC = DE/BC' },
        { title: 'الرابع المتناسب', detail: 'بما أن النسب متساوية، يمكننا استخدام "الرابع المتناسب" (جداء الطرفين في جداء الوسطين) لإيجاد المجهول.', math: 'x = (a × b) / c' }
    ];

    const problems = [
        { ad: 2, ab: 6, ae: 3, missing: 'ac', ans: 9 }, { ad: 4, ab: 10, ae: 6, missing: 'ac', ans: 15 },
        { ad: 3, ab: 9, ac: 12, missing: 'ae', ans: 4 }, { ab: 10, ae: 2, ac: 8, missing: 'ad', ans: 2.5 },
        { ad: 5, ab: 15, ae: 4, missing: 'ac', ans: 12 }, { ad: 3, ab: 12, ac: 16, missing: 'ae', ans: 4 }
    ];

    const generateProblem = () => {
        const p = problems[Math.floor(Math.random() * problems.length)];
        setProblem(p); setPhase('practice'); setStep(0); setInputVal(''); setError(false); setReward(null);
    };

    const handleCheck = () => {
        if (parseFloat(inputVal) === problem.ans) {
            setStep(1);
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            rewardService.claimLabReward('thales-length').then(d => d.status === 'success' && setReward(d)).catch(console.error);
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-sky-50 text-sky-600 border-sky-100 shadow-sm'}`}>
                                <Triangle size={14} /> التناسب والهندسة
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>حساب طول بطاليس</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-sky-50 text-sky-600 border-sky-100'}`}>
                                <Target size={14} /> {step === 0 ? 'الرابع المتناسب' : 'عملية ناجحة'}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {step === 1 ? 'أحسنت! حساب دقيق.' : `أوجد الطول المجهول ${problem.missing.toUpperCase()}`}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                            <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>القاعدة المباشرة:</h3>
                            <div className={`p-3 rounded-xl border text-center ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <div className={`text-base md:text-lg font-black font-mono ${theme.textMain}`} dir="ltr">
                                    <span className="text-sky-400">AD/AB</span> = <span className="text-emerald-400">AE/AC</span>
                                </div>
                            </div>
                            <p className={`mt-3 text-sm ${theme.textSub}`}>بمعرفة 3 أطوال، يمكننا حساب الطول الرابع (الرابع المتناسب).</p>
                            <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">تعلّم الطريقة</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1rem] shadow-2xl">
                            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-sky-600 to-blue-900' : 'bg-gradient-to-br from-sky-500 to-sky-600'}`} />
                            <div className="relative p-8 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Triangle size={20} className="animate-pulse text-sky-200" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase">بدء الحساب</span>
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
                                <div className="p-6 rounded-2xl border-2 border-sky-500/30 bg-black/40 w-full">
                                    <span className="text-sm md:text-base font-mono font-black text-sky-400" dir="ltr">{learnPages[learnStep].math}</span>
                                </div>
                            </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                            <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                            {learnStep < 1 ? (
                                <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black text-lg">التالي</button>
                            ) : (
                                <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-lg">ابدأ الحساب</button>
                            )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-4xl px-2">
                        <div className={`w-full p-3 md:p-4 rounded-[1rem] border backdrop-blur-3xl mb-2 text-center ${step === 1 ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                            <div className="flex justify-center mb-2">
                                <svg width="150" height="112" viewBox="0 0 200 150" className="drop-shadow-glow-sky">
                                    <path d="M100 20 L20 140 L180 140 Z" fill="none" stroke={isDarkMode ? '#64748b' : '#94a3b8'} strokeWidth="2" />
                                    <line x1="60" y1="80" x2="140" y2="80" stroke={isDarkMode ? '#0ea5e9' : '#0284c7'} strokeWidth="3" />
                                    <text x="95" y="15" fontSize="12" fontWeight="bold" fill={theme.textMain}>A</text>
                                    <text x="10" y="145" fontSize="12" fontWeight="bold" fill={theme.textMain}>B</text>
                                    <text x="180" y="145" fontSize="12" fontWeight="bold" fill={theme.textMain}>C</text>
                                    <text x="50" y="85" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#7dd3fc' : '#0ea5e9'}>D</text>
                                    <text x="145" y="85" fontSize="12" fontWeight="bold" fill={isDarkMode ? '#7dd3fc' : '#0ea5e9'}>E</text>
                                </svg>
                            </div>
                            <div className={`p-4 rounded-xl bg-black/20 border border-white/5 mb-4 font-mono text-sm md:text-base flex justify-center gap-4 ${theme.textMain}`} dir="ltr">
                                <div>
                                    <div className={`border-b-2 border-current pb-1 px-2 ${problem.missing === 'ad' ? 'text-sky-400 font-black' : ''}`}>{problem.missing === 'ad' ? 'AD' : problem.ad}</div>
                                    <div className={`pt-1 px-2 ${problem.missing === 'ab' ? 'text-sky-400 font-black' : ''}`}>{problem.missing === 'ab' ? 'AB' : problem.ab}</div>
                                </div>
                                <div className="flex items-center font-black">=</div>
                                <div>
                                    <div className={`border-b-2 border-current pb-1 px-2 ${problem.missing === 'ae' ? 'text-sky-400 font-black' : ''}`}>{problem.missing === 'ae' ? 'AE' : problem.ae}</div>
                                    <div className={`pt-1 px-2 ${problem.missing === 'ac' ? 'text-sky-400 font-black' : ''}`}>{problem.missing === 'ac' ? 'AC' : problem.ac}</div>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {step === 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-2xl">
                                    <div className={`p-3 rounded-2xl border shadow-2xl backdrop-blur-3xl mb-2 flex items-center justify-center gap-4 ${theme.card}`} dir="ltr">
                                        <span className={`text-base md:text-lg font-black font-mono uppercase ${theme.textMain}`}>{problem.missing} =</span>
                                        <input type="number" step="0.1" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-24 md:w-32 bg-black/60 border-2 rounded-xl text-center p-2 text-xl font-bold outline-none transition-all ${error ? 'border-rose-500 animate-shake' : 'border-sky-500/50 text-sky-400 focus:border-sky-400'}`} placeholder="?" autoFocus />
                                    </div>
                                    <button onClick={handleCheck} className="w-full py-2 md:py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-3">
                                        <CheckCircle2 size={20} /> تحقق من الإجابة
                                    </button>
                                </motion.div>
                            )}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-2xl">
                                    <MasteryRewardCard reward={reward} />
                                    <button onClick={generateProblem} className="mt-2 w-full py-2 md:py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black text-lg">تحدي جديد</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {phase !== 'intro' && step === 0 && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-sky-400" /> الرجوع
                    </button>
                </div>
            )}
        </div>
    );
}
