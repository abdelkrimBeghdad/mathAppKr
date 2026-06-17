import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Divide, CheckCircle2, HelpCircle, X, ArrowRight, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function VecMidpointLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro');
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); // 0: sums, 1: division
    const [challengeStep, setChallengeStep] = useState(0); 
    
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');
    const [input4, setInput4] = useState('');
    
    const [error, setError] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const challenges = [
        { ax: 2, ay: 4, bx: 8, by: 6 }, // 5, 5
        { ax: -4, ay: 3, bx: 2, by: -1 }, // -1, 1
        { ax: -3, ay: -5, bx: 1, by: 3 } // -1, -1
    ];

    const currentChallenge = challenges[challengeStep];

    const learnPages = [
        {
            title: 'نقطة التوازن',
            detail: 'لحساب إحداثيات منتصف قطعة مستقيم، نحن نبحث عن "مركز الثقل" أو نقطة التوازن بين البداية والنهاية.',
            visual: (
                <div className="flex flex-col items-center gap-4 w-full h-32 justify-center">
                    <div className="relative w-64 h-2 bg-slate-600 rounded-full flex items-center">
                        <div className="absolute -left-3 -top-3 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs font-black">A</div>
                        <div className="absolute -right-3 -top-3 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-xs font-black">B</div>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="absolute left-1/2 -translate-x-1/2 -top-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-black border-2 border-white">M</motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute left-1/2 -translate-x-1/2 top-4">
                            <Scale className="text-emerald-400" />
                        </motion.div>
                    </div>
                </div>
            )
        },
        {
            title: 'قانون المتوسط الحسابي',
            detail: 'على عكس الشعاع (الذي نستخدم فيه الطرح)، المنتصف هو جمع ثم قسمة على 2. نجمع الـ x مع الـ x، والـ y مع الـ y.',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-mono text-center" dir="ltr">
                    <div className="text-white">M</div>
                    <div className="flex items-center justify-center gap-4 text-2xl border-2 border-emerald-500/30 p-4 rounded-xl bg-black/40">
                        <div className="flex flex-col items-center">
                            <span className="text-emerald-400 border-b-2 border-emerald-400 pb-1">X<sub className="text-sm">A</sub> + X<sub className="text-sm">B</sub></span>
                            <span className="text-emerald-400 pt-1">2</span>
                        </div>
                        <span className="text-white">,</span>
                        <div className="flex flex-col items-center">
                            <span className="text-cyan-400 border-b-2 border-cyan-400 pb-1">Y<sub className="text-sm">A</sub> + Y<sub className="text-sm">B</sub></span>
                            <span className="text-cyan-400 pt-1">2</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'مثال تطبيقي',
            detail: 'A(2, 4) و B(6, 8)',
            visual: (
                <div className="flex flex-col gap-4 text-2xl font-mono text-center" dir="ltr">
                    <div className="flex flex-col items-center justify-center gap-2 text-white">
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-400">X = (2 + 6) / 2</span> = 8 / 2 = <span className="text-white font-black">4</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-400">Y = (4 + 8) / 2</span> = 12 / 2 = <span className="text-white font-black">6</span>
                        </div>
                        <div className="mt-4 text-emerald-300 font-black">M(4, 6)</div>
                    </div>
                </div>
            )
        }
    ];

    const handleAnswer = async () => {
        let isCorrect = false;
        
        if (step === 0) {
            // Fill sum: x_A + x_B, y_A + y_B
            if (parseInt(input1) === currentChallenge.ax + currentChallenge.bx && 
                parseInt(input2) === currentChallenge.ay + currentChallenge.by) {
                isCorrect = true;
            }
        } else if (step === 1) {
            // Final division
            const ansX = (currentChallenge.ax + currentChallenge.bx) / 2;
            const ansY = (currentChallenge.ay + currentChallenge.by) / 2;
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
                        const data = await rewardService.claimLabReward('vec-midpoint-mastery');
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
        "اجمع إحداثيات X معاً (البسط الأول)، واجمع إحداثيات Y معاً (البسط الثاني). تذكر: إشارة الناقص تطغى على الزائد.",
        "اقسم المجموع الذي حصلت عليه على 2 لتحصل على الإحداثيات النهائية لنقطة المنتصف."
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                <Divide size={16} /> المنتصف والتوازن
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white' : 'text-slate-900'}`}>مركز الثقل</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : reward ? 'مكتمل' : `تحدي المنتصف ${challengeStep + 1}/${challenges.length}`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow">
                                <Scale size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف توجد النقطة المركزية (المنتصف) بين نقطتين، باستخدام قانون المتوسط الحسابي.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل التفاعلي</button>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !reward && (
                    <div className="flex flex-col items-center w-full max-w-xl px-2">
                        
                        <div className={`w-full p-6 rounded-[1rem] border backdrop-blur-3xl mb-4 text-center ${theme.card}`}>
                            <h3 className={`text-xl font-black mb-3 ${theme.textMain}`}>احسب إحداثيات المنتصف M</h3>
                            <div className="flex items-center justify-center gap-4 text-xl font-mono font-black" dir="ltr">
                                <span className="text-amber-400">A({currentChallenge.ax}, {currentChallenge.ay})</span>
                                <span className="text-blue-400">B({currentChallenge.bx}, {currentChallenge.by})</span>
                            </div>
                        </div>

                        <div className={`w-full p-4 md:p-5 rounded-[1rem] border backdrop-blur-3xl mb-4 shadow-2xl flex flex-col items-center ${theme.card}`}>
                            
                            <div className={`text-sm md:text-base font-bold text-center mb-3 ${theme.textSub}`}>
                                {step === 0 ? "الخطوة 1: اجمع إحداثيات x معاً، وإحداثيات y معاً (البسط)" : "الخطوة 2: اقسم المجاميع على 2"}
                            </div>

                            <div className="flex items-center gap-4 text-xl font-black font-mono" dir="ltr">
                                <span className="text-emerald-400 text-2xl">M (</span>
                                {step === 0 ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="border-b-2 border-emerald-500/50 pb-2">
                                                <input type="number" value={input1} onChange={e => setInput1(e.target.value)} autoFocus className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="ΣX" />
                                            </div>
                                            <span className="text-emerald-500/50 pt-2">2</span>
                                        </div>
                                        <span className="text-white">,</span>
                                        <div className="flex flex-col items-center">
                                            <div className="border-b-2 border-cyan-500/50 pb-2">
                                                <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-cyan-500/50 text-cyan-400'}`} placeholder="ΣY" />
                                            </div>
                                            <span className="text-cyan-500/50 pt-2">2</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} autoFocus className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="X_M" />
                                        <span className="text-white">,</span>
                                        <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake text-rose-400' : 'border-cyan-500/50 text-cyan-400'}`} placeholder="Y_M" />
                                    </div>
                                )}
                                <span className="text-emerald-400 text-2xl">)</span>
                            </div>

                        </div>

                        <div className="w-full flex gap-2">
                            <button onClick={() => setShowHint(!showHint)} className={`px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center ${isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                <HelpCircle size={20} />
                            </button>
                            <button onClick={handleAnswer} className="flex-grow py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2">
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
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setStep(0); }} className="mt-4 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
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
