import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, CheckCircle2, HelpCircle, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function VecCalcLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); // 0: fill formula, 1: calculate final
    const [challengeStep, setChallengeStep] = useState(0); 
    
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');
    const [input4, setInput4] = useState('');
    
    const [error, setError] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const challenges = [
        { ax: 1, ay: 2, bx: 4, by: 5 }, // simple
        { ax: -2, ay: 3, bx: 1, by: -1 }, // negative trap
        { ax: 0, ay: -4, bx: -3, by: -4 } // zero
    ];

    const currentChallenge = challenges[challengeStep];

    const learnPages = [
        {
            title: 'القانون الذهبي',
            detail: 'لحساب مركبات أي شعاع جبرياً (بدون رسم)، نطبق قاعدة واحدة صارمة: النهاية ناقص البداية.',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-mono text-center" dir="ltr">
                    <div className="text-white">AB</div>
                    <div className="flex items-center justify-center gap-2 text-2xl border-2 border-emerald-500/30 p-4 rounded-xl">
                        <span className="text-emerald-400">X<sub className="text-sm">B</sub> - X<sub className="text-sm">A</sub></span>
                        <br/>
                        <span className="text-cyan-400">Y<sub className="text-sm">B</sub> - Y<sub className="text-sm">A</sub></span>
                    </div>
                </div>
            )
        },
        {
            title: 'تطبيق مباشر',
            detail: 'إذا كانت A(1, 2) و B(4, 5). نبدأ دائماً بإحداثيات النقطة B.',
            visual: (
                <div className="flex flex-col gap-4 text-2xl font-mono text-center" dir="ltr">
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-slate-400">A(1, 2)</span>
                        <span className="text-amber-400">B(4, 5)</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-white mt-4">
                        <span>AB</span>
                        <div className="flex flex-col border-l-2 border-slate-600 pl-4 items-start">
                            <span><span className="text-amber-400">4</span> - <span className="text-slate-400">1</span> = <span className="text-emerald-400">3</span></span>
                            <span><span className="text-amber-400">5</span> - <span className="text-slate-400">2</span> = <span className="text-cyan-400">3</span></span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'فخ الإشارات!',
            detail: 'احذر عندما تكون إحداثيات البداية سالبة! قاعدة الطرح مع الرقم السالب تتحول إلى جمع.',
            visual: (
                <div className="flex flex-col gap-4 text-2xl font-mono text-center" dir="ltr">
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-slate-400">A(-2, 3)</span>
                        <span className="text-amber-400">B(1, 5)</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-white mt-4">
                        <span>AB</span>
                        <div className="flex flex-col border-l-2 border-rose-500/50 pl-4 items-start">
                            <span><span className="text-amber-400">1</span> - <span className="text-rose-400">(-2)</span> = <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-emerald-400 font-black">1 + 2 = 3</motion.span></span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const handleAnswer = async () => {
        let isCorrect = false;
        
        if (step === 0) {
            // Fill formula: x_B, x_A, y_B, y_A
            if (parseInt(input1) === currentChallenge.bx && parseInt(input2) === currentChallenge.ax && 
                parseInt(input3) === currentChallenge.by && parseInt(input4) === currentChallenge.ay) {
                isCorrect = true;
            }
        } else if (step === 1) {
            // Final values
            const ansX = currentChallenge.bx - currentChallenge.ax;
            const ansY = currentChallenge.by - currentChallenge.ay;
            if (parseInt(input1) === ansX && parseInt(input2) === ansY) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            setError(false);
            setInput1(''); setInput2(''); setInput3(''); setInput4('');
            setShowHint(false);

            if (step === 0) {
                setStep(1);
            } else {
                if (challengeStep < challenges.length - 1) {
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                    setChallengeStep(challengeStep + 1);
                    setStep(0);
                } else {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    try {
                        const data = await rewardService.claimLabReward('vec-calc-mastery');
                        if (data.status === 'success') setReward(data);
                    } catch (err) { console.error(err); }
                }
            }
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    const hints = [
        "ابدأ دائماً بإحداثيات النقطة B (النهاية) ثم اطرح منها إحداثيات النقطة A (البداية).",
        "قم بإجراء العملية الحسابية. تذكر أن: ناقص عدد سالب يساوي زائد!"
    ];

    const theme = {
        container: isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-100 shadow-2xl',
        textMain: isDarkMode ? 'text-white' : 'text-slate-900',
        textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
        card: isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-slate-50 border-slate-200',
    };

    return (
        <div className={`w-full h-full min-h-[300px] max-h-[85vh] ${theme.container} rounded-[1rem] md:rounded-[1.5rem] p-4 relative overflow-hidden flex flex-col font-sans border transition-all duration-500`} dir="rtl">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                <Calculator size={16} /> الحساب الجبري
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-white' : 'text-slate-900'}`}>شيفرة الإحداثيات</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : `تحدي الحساب ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow">
                                <Calculator size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>لا حاجة للرسم بعد الآن! تعلم كيف تحسب مركبات أي شعاع باستخدام إحداثيات بدايته ونهايته بدقة تامة.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل التفاعلي</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className={`p-6 rounded-2xl bg-black/40 border border-white/5 mx-auto max-w-md min-h-[160px] flex items-center justify-center`}>
                                 {learnPages[learnStep].visual}
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-xl px-2">
                        
                        <div className={`w-full p-6 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <h3 className={`text-xl font-black mb-3 ${theme.textMain}`}>احسب مركبات الشعاع AB</h3>
                            <div className="flex items-center justify-center gap-4 text-xl font-mono font-black" dir="ltr">
                                <span className="text-slate-400">A({currentChallenge.ax}, {currentChallenge.ay})</span>
                                <span className="text-amber-400">B({currentChallenge.bx}, {currentChallenge.by})</span>
                            </div>
                        </div>

                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 shadow-2xl flex flex-col items-center ${theme.card}`}>
                            
                            <div className={`text-sm md:text-base font-bold text-center mb-3 ${theme.textSub}`}>
                                {step === 0 ? "الخطوة 1: طبق القاعدة (النهاية ناقص البداية)" : "الخطوة 2: قم بإجراء العمليات الحسابية"}
                            </div>

                            <div className="flex items-center gap-4 text-xl font-black font-mono" dir="ltr">
                                <span className="text-emerald-400 text-2xl">AB (</span>
                                {step === 0 ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} autoFocus className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-amber-500/50 text-amber-400'}`} placeholder="X_B" />
                                            <span className="text-white">-</span>
                                            <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-slate-500/50 text-slate-300'}`} placeholder="X_A" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={input3} onChange={e => setInput3(e.target.value)} className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-amber-500/50 text-amber-400'}`} placeholder="Y_B" />
                                            <span className="text-white">-</span>
                                            <input type="number" value={input4} onChange={e => setInput4(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-slate-500/50 text-slate-300'}`} placeholder="Y_A" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} autoFocus className={`w-20 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="x" />
                                        <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-20 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-cyan-500/50 text-cyan-400'}`} placeholder="y" />
                                    </div>
                                )}
                                <span className="text-emerald-400 text-2xl">)</span>
                            </div>

                        </div>

                        <div className="w-full flex gap-2">
                            <button onClick={() => setShowHint(!showHint)} className={`px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center ${isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                <HelpCircle size={20} />
                            </button>
                            <button onClick={handleAnswer} className="flex-grow py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2">
                                <CheckCircle2 size={20} /> تأكيد
                            </button>
                        </div>
                        
                        <AnimatePresence>
                            {showHint && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full text-center mt-2">
                                    <p className="text-amber-500 text-sm font-bold">{hints[step]}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {reward && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setStep(0); }} className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && !reward && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setChallengeStep(0); setStep(0); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
