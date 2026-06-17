import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma, CheckCircle2, HelpCircle, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function SysAdditionLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); // 0: multiply, 1: write new eq, 2: solve x, 3: solve y, 4: reward
    
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');
    const [error, setError] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    // Problem: 2x + y = 4 and x - 2y = -3
    const problem = {
        multiplier: 2,
        new_eq1: { a: 4, b: 2, c: 8 },
        x: 1, y: 2
    };

    const learnPages = [
        {
            title: 'مبدأ الجمع',
            detail: 'إذا كانت المعاملات متعاكسة (+2y و -2y)، يمكننا جمع المعادلتين للتخلص من المجهول y تماماً، لتبقى لدينا معادلة بمجهول واحد (x).',
            visual: (
                <div className="flex flex-col gap-4 text-2xl font-mono" dir="ltr">
                    <div className="text-blue-400">1) 2x + y = 4</div>
                    <div className="text-violet-400">2) x - 2y = -3</div>
                </div>
            )
        },
        {
            title: 'خطوة 1: الموازنة',
            detail: 'نلاحظ أن y في المعادلة الأولى معامله 1، وفي الثانية -2. لنضربهما في 2 لتصبح المعادلة الأولى تحتوي على +2y.',
            visual: (
                <div className="flex flex-col items-center gap-4 text-2xl font-mono" dir="ltr">
                    <div className="text-slate-400">(2x + y = 4) × <span className="text-rose-400 font-black">2</span></div>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-blue-400 font-black mt-2">
                        1) 4x + 2y = 8
                    </motion.div>
                    <div className="text-violet-400">2) x - 2y = -3</div>
                </div>
            )
        },
        {
            title: 'خطوة 2: الاصطدام المباشر',
            detail: 'الآن نجمع المعادلتين طرفاً لطرف. لاحظ كيف تتصادم وتختفي (+2y) مع (-2y).',
            visual: (
                <div className="flex flex-col items-center gap-4 text-xl font-mono relative" dir="ltr">
                    <div className="text-blue-400 relative z-10 w-full text-center">4x <span className="text-emerald-400">+ 2y</span> = 8</div>
                    <div className="text-violet-400 relative z-10 w-full border-b-2 border-slate-600 pb-2 text-center">+ x <span className="text-rose-400">- 2y</span> = -3</div>
                    
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="text-white mt-4 font-black">
                        5x <motion.span initial={{ scale: 1 }} animate={{ scale: 0, opacity: 0 }} transition={{ delay: 2.5, duration: 0.5 }} className="text-slate-600 inline-block px-2 relative"><span className="absolute inset-0 top-1/2 h-1 bg-red-500 transform -rotate-12"></span>+ 0y</motion.span> = 5
                    </motion.div>
                </div>
            )
        },
        {
            title: 'خطوة 3: التبسيط والتعويض العكسي',
            detail: 'من المعادلة (5x = 5) نجد بسهولة أن x = 1. الآن نعوض بـ 1 في المعادلة الأصلية لنجد y.',
            visual: (
                <div className="flex flex-col items-center gap-4 text-2xl font-mono" dir="ltr">
                    <div className="text-blue-400">2<span className="text-amber-400 font-black">(1)</span> + y = 4</div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-white font-black mt-2">
                        2 + y = 4  →  <span className="text-emerald-400">y = 2</span>
                    </motion.div>
                </div>
            )
        }
    ];

    const handleCheckStep = async () => {
        let isCorrect = false;
        
        if (step === 0) {
            // Multiply by 2
            if (parseInt(input1) === problem.multiplier) isCorrect = true;
        } else if (step === 1) {
            // 4x + 2y = 8
            if (parseInt(input1) === problem.new_eq1.a && parseInt(input2) === problem.new_eq1.b && parseInt(input3) === problem.new_eq1.c) isCorrect = true;
        } else if (step === 2) {
            // Solve x = 1
            if (parseInt(input1) === problem.x) isCorrect = true;
        } else if (step === 3) {
            // Solve y = 2
            if (parseInt(input1) === problem.y) isCorrect = true;
        }

        if (isCorrect) {
            setError(false);
            setInput1(''); setInput2(''); setInput3('');
            setShowHint(false);
            if (step < 3) {
                setStep(s => s + 1);
            } else {
                setStep(4);
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                try {
                    const data = await rewardService.claimLabReward('sys-add-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    const hints = [
        "نريد التخلص من y. المعادلة الثانية تحتوي على -2y، لذا يجب أن تصبح المعادلة الأولى محتوية على +2y. اضرب في 2.",
        "اضرب كل طرف في المعادلة الأولى في 2. (2×2=4)، (1×2=2)، (4×2=8)",
        "اجمع: 4x مع x تساوي 5x. و 2y مع -2y تساوي 0. و 8 مع -3 تساوي 5. إذن 5x = 5.",
        "عوض x بـ 1 في المعادلة: 2(1) + y = 4. إذن 2 + y = 4."
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="text-center z-10 mb-2 pt-1">
                <AnimatePresence mode="wait">
                    {phase === 'intro' ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-2 border backdrop-blur-md ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                <Sigma size={16} /> طريقة الجمع
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white' : 'text-slate-900'}`}>الاندماج الخطي</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : step === 4 ? 'مكتمل' : `خطوة التدريب ${step + 1}/4`}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
                {phase === 'intro' && (
                    <div className="flex flex-col items-center max-w-2xl text-center px-4">
                        <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                            <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto shadow-glow">
                                <Sigma size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تضرب المعادلات لتوازن معاملاتها، ثم تجمعها لتفجير أحد المجاهيل وإزالته من طريقك.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل التفاعلي</button>
                        </div>
                        <button onClick={() => setPhase('practice')} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>تخطي الشرح والبدء بالتدريب</button>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && step < 4 && (
                    <div className="flex flex-col items-center w-full max-w-2xl px-2">
                        {/* The Problem Box */}
                        <div className={`w-full p-4 md:p-6 rounded-[1rem] border backdrop-blur-3xl mb-4 flex flex-col items-center justify-center gap-2 font-mono text-base md:text-lg ${theme.card} ${theme.textMain}`} dir="ltr">
                            <div className={step === 0 || step === 1 ? "text-blue-400 font-black" : ""}>1) 2x + y = 4</div>
                            <div className="text-violet-400 font-black">2) x - 2y = -3</div>
                        </div>

                        {/* Interactive Step Box */}
                        <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full p-4 md:p-6 rounded-[1rem] border shadow-2xl backdrop-blur-3xl flex flex-col items-center gap-4 ${theme.card}`}>
                            <div className={`text-sm md:text-base font-bold text-center ${theme.textSub}`}>
                                {step === 0 && "الخطوة 1: نضرب المعادلة (1) في عدد لنجعل معامل y متعاكساً مع المعادلة (2). ما هو هذا العدد؟"}
                                {step === 1 && "الخطوة 2: اكتب المعادلة (1) الجديدة بعد الضرب:"}
                                {step === 2 && "الخطوة 3: اجمع المعادلتين (الجديدة والثانية) طرفاً لطرف لحساب قيمة x"}
                                {step === 3 && "الخطوة 4: عوض x بالعدد الذي وجدته في المعادلة (1) لحساب y"}
                            </div>
                            
                            <div className="flex items-center justify-center gap-2 md:gap-3 font-mono text-lg md:text-2xl mt-2 w-full" dir="ltr">
                                {step === 0 && (
                                    <>
                                        <span className="text-blue-400 font-black">(2x + y = 4) × </span>
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-20 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-blue-500/50 text-blue-400'}`} placeholder="?" autoFocus />
                                    </>
                                )}
                                {step === 1 && (
                                    <>
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className={`w-12 md:w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500' : 'border-blue-500/50 text-blue-400'}`} autoFocus />
                                        <span className="text-white">x +</span>
                                        <input type="number" value={input2} onChange={e => setInput2(e.target.value)} className={`w-12 md:w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500' : 'border-blue-500/50 text-blue-400'}`} />
                                        <span className="text-white">y =</span>
                                        <input type="number" value={input3} onChange={e => setInput3(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-12 md:w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500' : 'border-blue-500/50 text-blue-400'}`} />
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        <span className="text-emerald-400 font-black">5x = 5  →  x = </span>
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-20 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="?" autoFocus />
                                    </>
                                )}
                                {step === 3 && (
                                    <>
                                        <span className="text-amber-400 font-black">2(1) + y = 4  →  y = </span>
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-20 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-amber-500/50 text-amber-400'}`} placeholder="?" autoFocus />
                                    </>
                                )}
                            </div>

                            <div className="w-full flex gap-2 mt-2">
                                <button onClick={() => setShowHint(!showHint)} className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center ${isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                    <HelpCircle size={20} />
                                </button>
                                <button onClick={handleCheckStep} className="flex-grow py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2">
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
                        </motion.div>
                    </div>
                )}

                {step === 4 && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setStep(0); setInput1(''); setInput2(''); setInput3(''); }} className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && step < 4 && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setStep(0); setInput1(''); setInput2(''); setInput3(''); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
