import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Map, Target, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function PythProblemsLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0);
    const [problem, setProblem] = useState(null);
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [reward, setReward] = useState(null);

    const learnPages = [
        { title: 'ترييض مشكل هندسي', detail: 'تستخدم نظرية فيثاغورس لحل مسائل من الواقع تتضمن أطوالاً مجهولة في مسارات متعامدة.', math: 'تخيل الموقف وارسم مثلثاً' },
        { title: 'خطوات الحل', detail: '1. اقرأ المسألة وارسم شكلاً تقريبياً.\n2. حدد الزاوية القائمة والوتر.\n3. طبق نظرية فيثاغورس لإيجاد المجهول.', math: 'c² = a² + b²' }
    ];

    const problems = [
        { q: 'سلم طوله 5m متكئ على حائط. إذا كانت المسافة بين أسفل السلم والحائط 3m، فما هو ارتفاع قمة السلم عن الأرض؟', ans: 4, type: 'leg' },
        { q: 'مشى سعيد 6km شرقاً ثم 8km شمالاً. كم المسافة المباشرة بين نقطة البداية والنهاية؟', ans: 10, type: 'hyp' },
        { q: 'شجرة انكسرت، قمتها تلامس الأرض على بعد 5m من الجذع. إذا كان ارتفاع الجزء المتبقي 12m، فما طول الجزء المنكسر؟', ans: 13, type: 'hyp' },
        { q: 'طائرة ورقية تحلق بخيط طوله 25m. إذا كانت المسافة الأفقية بين الطفل والطائرة 24m، فما ارتفاع الطائرة؟', ans: 7, type: 'leg' }
    ];

    const generateProblem = () => {
        const p = problems[Math.floor(Math.random() * problems.length)];
        setProblem(p); setPhase('practice'); setStep(0); setInputVal(''); setError(false); setReward(null);
    };

    const handleCheck = () => {
        if (parseInt(inputVal) === problem.ans) {
            setStep(1);
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            rewardService.claimLabReward('pyth-problems').then(d => d.status === 'success' && setReward(d)).catch(console.error);
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'}`}>
                                <Map size={14} /> تطبيقات واقعية
                            </div>
                            <h2 className={`text-sm md:text-base font-black leading-tight tracking-tighter ${theme.textMain}`}>مسائل فيثاغورس</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                <Target size={14} /> {step === 0 ? 'استخدم خيالك وارسم' : 'حل هندسي رائع'}
                            </div>
                            <h2 className={`text-lg md:text-2xl font-black tracking-tighter ${theme.textMain}`}>
                                {step === 1 ? 'ممتاز! إجابة دقيقة.' : 'أوجد الحل للمسألة'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                            <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>سر النجاح:</h3>
                            <div className={`p-3 rounded-xl border text-center ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <div className={`text-lg font-black ${theme.textMain}`}>حول النص إلى رسم هندسي</div>
                            </div>
                            <p className={`mt-3 text-sm ${theme.textSub}`}>بمجرد تحديد الوتر والضلعين القائمين، تصبح المسألة عملية حسابية بسيطة.</p>
                            <button onClick={() => setPhase('learn')} className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 text-sm">كيف أبدأ؟</button>
                        </div>
                        <motion.button onClick={generateProblem} className="relative group cursor-pointer overflow-hidden rounded-[1rem] shadow-2xl">
                            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-amber-600 to-orange-900' : 'bg-gradient-to-br from-amber-500 to-amber-600'}`} />
                            <div className="relative p-8 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Map size={20} className="animate-bounce text-amber-200" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase">اكتشف مسألة</span>
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
                                <div className="p-6 rounded-2xl border-2 border-amber-500/30 bg-black/40 w-full">
                                    <span className="text-sm md:text-base font-mono font-black text-amber-400" dir="ltr">{learnPages[learnStep].math}</span>
                                </div>
                            </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                            <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                            {learnStep < 1 ? (
                                <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-lg">التالي</button>
                            ) : (
                                <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-lg">أرني مسألة</button>
                            )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && problem && (
                    <div className="flex flex-col items-center w-full max-w-4xl px-2">
                        <div className={`w-full p-3 md:p-4 rounded-[1rem] border backdrop-blur-3xl mb-2 text-center ${step === 1 ? 'border-emerald-500/40 bg-emerald-500/5' : theme.card}`}>
                            <p className={`text-sm md:text-base font-bold leading-relaxed ${theme.textMain}`}>"{problem.q}"</p>
                        </div>

                        <AnimatePresence>
                            {step === 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-2xl">
                                    <div className={`p-3 rounded-2xl border shadow-2xl backdrop-blur-3xl mb-2 flex flex-col items-center justify-center gap-4 ${theme.card}`}>
                                        <span className={`text-sm font-bold ${theme.textSub}`}>اكتب الجواب النهائي (رقم فقط):</span>
                                        <div className="flex gap-2" dir="ltr">
                                            <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} className={`w-24 md:w-32 bg-black/60 border-2 rounded-xl text-center p-2 text-xl font-bold outline-none transition-all ${error ? 'border-rose-500 animate-shake' : 'border-amber-500/50 text-amber-400 focus:border-amber-400'}`} placeholder="?" autoFocus />
                                        </div>
                                    </div>
                                    <button onClick={handleCheck} className="w-full py-2 md:py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-3">
                                        <CheckCircle2 size={20} /> تحقق من الإجابة
                                    </button>
                                </motion.div>
                            )}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-2xl">
                                    <MasteryRewardCard reward={reward} />
                                    <button onClick={generateProblem} className="mt-2 w-full py-2 md:py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-lg">مسألة جديدة</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {phase !== 'intro' && step === 0 && (
                <div className="absolute bottom-4 right-4 z-30">
                    <button onClick={() => setPhase('intro')} className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 backdrop-blur-3xl border transition-all ${isDarkMode ? 'bg-white/5 text-white border-white/10' : 'bg-white text-slate-900 border-slate-200 shadow-xl'}`}>
                        <RotateCcw size={14} className="text-amber-400" /> الرجوع
                    </button>
                </div>
            )}
        </div>
    );
}
