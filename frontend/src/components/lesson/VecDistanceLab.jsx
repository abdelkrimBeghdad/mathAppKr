import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, CheckCircle2, HelpCircle, X, ArrowRight, TriangleRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function VecDistanceLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); // 0: dx & dy, 1: squares, 2: root
    const [challengeStep, setChallengeStep] = useState(0); 
    
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const challenges = [
        { ax: 1, ay: 2, bx: 4, by: 6 }, // dx=3, dy=4, ans=5
        { ax: -2, ay: 1, bx: 4, by: -7 }, // dx=6, dy=-8, ans=10
        { ax: -3, ay: -2, bx: 2, by: 10 } // dx=5, dy=12, ans=13
    ];

    const currentChallenge = challenges[challengeStep];

    const learnPages = [
        {
            title: 'سر المسافة',
            detail: 'طويلة الشعاع (أو المسافة بين البداية والنهاية) هي ببساطة طول "وتر" في مثلث قائم زاويته. هل تذكر نظرية فيثاغورس؟',
            visual: (
                <div className="relative w-48 h-32 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center mx-auto">
                    <svg viewBox="-1 -1 6 6" className="w-full h-full overflow-visible">
                        <g transform="scale(1, -1)">
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} x1="0" y1="-1" x2="4" y2="-1" stroke="#34d399" strokeWidth="0.1" strokeDasharray="0.2 0.1" />
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1 }} x1="4" y1="-1" x2="4" y2="2" stroke="#38bdf8" strokeWidth="0.1" strokeDasharray="0.2 0.1" />
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 2 }} x1="0" y1="-1" x2="4" y2="2" stroke="#d946ef" strokeWidth="0.2" />
                        </g>
                    </svg>
                    <div className="absolute top-8 left-16 text-fuchsia-400 font-black text-xl rotate-[-35deg]">AB</div>
                </div>
            )
        },
        {
            title: 'قانون الجذر التربيعي',
            detail: 'نطرح إحداثيات (النهاية - البداية)، نربع النواتج، نجمعها، ثم نضع الجميع تحت الجذر التربيعي العظيم!',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-mono text-center" dir="ltr">
                    <div className="text-white">AB =</div>
                    <div className="flex items-center justify-center text-xl text-emerald-400 border-2 border-emerald-500/30 p-4 rounded-xl bg-black/40">
                        <span className="text-2xl text-emerald-400 font-light translate-y-1">\u221A</span>
                        <span className="border-t-2 border-emerald-400 pt-1 mt-1">
                            (x<sub className="text-sm">B</sub> - x<sub className="text-sm">A</sub>)&sup2; + (y<sub className="text-sm">B</sub> - y<sub className="text-sm">A</sub>)&sup2;
                        </span>
                    </div>
                </div>
            )
        },
        {
            title: 'مثال تطبيقي',
            detail: 'A(1, 2) و B(4, 6)',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-mono text-center text-white" dir="ltr">
                    <div className="text-slate-400">AB = \u221A<span className="border-t border-slate-400"> (4 - 1)&sup2; + (6 - 2)&sup2; </span></div>
                    <div className="text-slate-300">AB = \u221A<span className="border-t border-slate-300"> (3)&sup2; + (4)&sup2; </span></div>
                    <div className="text-emerald-300">AB = \u221A<span className="border-t border-emerald-300"> 9 + 16 </span></div>
                    <div className="text-emerald-400">AB = \u221A<span className="border-t border-emerald-400"> 25 </span></div>
                    <div className="text-fuchsia-400 font-black text-xl mt-2">AB = 5</div>
                </div>
            )
        }
    ];

    const handleAnswer = async () => {
        let isCorrect = false;
        
        const dx = currentChallenge.bx - currentChallenge.ax;
        const dy = currentChallenge.by - currentChallenge.ay;
        const sumSq = (dx * dx) + (dy * dy);
        const ans = Math.sqrt(sumSq);

        if (step === 0) {
            // Fill dx and dy
            if (parseInt(input1) === dx && parseInt(input2) === dy) {
                isCorrect = true;
            }
        } else if (step === 1) {
            // Fill sumSq
            if (parseInt(input1) === sumSq) {
                isCorrect = true;
            }
        } else if (step === 2) {
            // Final root
            if (parseInt(input1) === ans) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            setError(false);
            setInput1(''); setInput2('');
            setShowHint(false);

            if (step < 2) {
                setStep(s => s + 1);
            } else {
                if (challengeStep < challenges.length - 1) {
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
                    setChallengeStep(challengeStep + 1);
                    setStep(0);
                } else {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    try {
                        const data = await rewardService.claimLabReward('vec-distance-mastery');
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
        "احسب أولاً القوسين: (النهاية ناقص البداية لـ x) و (النهاية ناقص البداية لـ y).",
        "قم بتربيع العددين اللذين وجدتهما، ثم اجمعهما معاً.",
        "ما هو العدد الذي إذا ضربته في نفسه يعطيك الرقم الموجود تحت الجذر؟"
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' : 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100'}`}>
                                <Ruler size={16} /> المسافة والطويلة
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-200 to-white' : 'text-slate-900'}`}>مقياس الفضاء</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' : 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : `تحدي المسافة ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-fuchsia-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow">
                                <Ruler size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تحسب المسافة الدقيقة بين نقطتين (طويلة الشعاع) باستخدام قانون الجذر التربيعي المستمد من فيثاغورس.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل التفاعلي</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتحدي</button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-3xl px-2">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl relative overflow-hidden text-center ${theme.card}`}>
                             <h3 className={`text-base md:text-lg font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                             <p className={`text-base md:text-lg ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                             <div className={`p-6 rounded-2xl bg-black/40 border border-white/5 mx-auto max-w-md min-h-[220px] flex items-center justify-center`}>
                                 {learnPages[learnStep].visual}
                             </div>
                        </motion.div>
                        <div className="flex justify-between items-center mt-6 px-4">
                             <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-2xl px-2">
                        
                        <div className={`w-full p-4 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <h3 className={`text-lg font-black mb-4 ${theme.textMain}`}>احسب المسافة AB</h3>
                            <div className="flex items-center justify-center gap-4 text-base md:text-lg font-mono font-black" dir="ltr">
                                <span className="text-emerald-400">A({currentChallenge.ax}, {currentChallenge.ay})</span>
                                <span className="text-cyan-400">B({currentChallenge.bx}, {currentChallenge.by})</span>
                            </div>
                        </div>

                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 shadow-2xl flex flex-col items-center ${theme.card}`}>
                            
                            <div className={`text-sm md:text-base font-bold text-center mb-3 ${theme.textSub}`}>
                                {step === 0 && "الخطوة 1: احسب (النهاية - البداية) لكل من x و y لتعويضهما في القانون"}
                                {step === 1 && "الخطوة 2: ربع العددين واجمعهما"}
                                {step === 2 && "الخطوة 3: احسب الجذر التربيعي النهائي"}
                            </div>

                            <div className="flex flex-col items-center gap-4 text-base md:text-lg font-black font-mono" dir="ltr">
                                {step === 0 && (
                                    <div className="flex items-center text-fuchsia-400">
                                        <span className="font-light text-xl translate-y-1">\u221A</span>
                                        <span className="border-t-2 border-fuchsia-400 pt-2 mt-2 flex items-center gap-2">
                                            (<input type="number" value={input1} onChange={e => setInput1(e.target.value)} autoFocus className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="\u0394x" />)&sup2; + 
                                            (<input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-cyan-500/50 text-cyan-400'}`} placeholder="\u0394y" />)&sup2;
                                        </span>
                                    </div>
                                )}
                                {step === 1 && (
                                    <div className="flex items-center text-fuchsia-400">
                                        <span className="font-light text-xl translate-y-1">\u221A</span>
                                        <span className="border-t-2 border-fuchsia-400 pt-2 mt-2 flex items-center gap-2">
                                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} autoFocus className={`w-24 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-amber-500/50 text-amber-400'}`} placeholder="Σ" />
                                        </span>
                                    </div>
                                )}
                                {step === 2 && (
                                    <div className="flex items-center text-fuchsia-400 gap-4">
                                        <span>AB =</span>
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} autoFocus className={`w-24 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-fuchsia-500/50 text-fuchsia-400'}`} placeholder="?" />
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="w-full flex gap-2">
                            <button onClick={() => setShowHint(!showHint)} className={`px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center ${isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                <HelpCircle size={20} />
                            </button>
                            <button onClick={handleAnswer} className="flex-grow py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2">
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
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setStep(0); }} className="mt-4 w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
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
