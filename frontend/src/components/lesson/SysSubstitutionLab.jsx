import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, CheckCircle2, HelpCircle, RotateCcw, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import MasteryRewardCard from './MasteryRewardCard';

export default function SysSubstitutionLab({ isDarkMode = true }) {
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(0); // 0: isolate, 1: inject, 2: solve y, 3: back-sub, 4: solve x, 5: reward
    
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    // Problem: x + 2y = 8 and 3x - y = 10
    // So x = 8 - 2y
    // 3(8 - 2y) - y = 10
    // 24 - 6y - y = 10  => -7y = -14 => y = 2
    // x = 8 - 2(2) = 4

    const problem = {
        eq1: { a: 1, b: 2, c: 8 }, // x + 2y = 8
        eq2: { a: 3, b: -1, c: 10 }, // 3x - y = 10
        x: 4, y: 2,
        isolated: '8-2y', // text answer for simplicity in guided steps
        c_isolated: 8,
        b_isolated: 2,
    };

    const learnPages = [
        {
            title: 'مبدأ التعويض',
            detail: 'تخيل أن لديك صندوقين (معادلتين). في طريقة التعويض، نفتح الصندوق الأسهل لنعرف قيمة (x) بدلالة (y).',
            visual: (
                <div className="flex flex-col gap-4 text-2xl font-mono" dir="ltr">
                    <div className="text-cyan-400">1) x + y = 5</div>
                    <div className="text-amber-400">2) 2x - y = 4</div>
                </div>
            )
        },
        {
            title: 'خطوة 1: العزل',
            detail: 'نختار المعادلة الأولى لأن معامل x فيها هو 1 (بسيطة جداً). نعزل x لوحده في طرف.',
            visual: (
                <div className="flex flex-col gap-4 text-xl font-mono" dir="ltr">
                    <div>x + y = 5</div>
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-emerald-400 font-black">
                        x = 5 - y
                    </motion.div>
                </div>
            )
        },
        {
            title: 'خطوة 2: الحقن السحري',
            detail: 'الآن نأخذ القيمة (5 - y) ونحقنها مكان x في المعادلة الثانية. شاهد كيف يختفي x!',
            visual: (
                <div className="flex flex-col items-center gap-3 text-xl font-mono" dir="ltr">
                    <div className="text-emerald-400">x = 5 - y</div>
                    <div className="text-amber-400">2<motion.span animate={{ color: ['#f59e0b', '#10b981', '#10b981'] }} className="font-black border-b-2 border-emerald-400 px-2">x</motion.span> - y = 4</div>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 }} className="text-white mt-4 border-2 border-emerald-500/50 p-4 rounded-2xl">
                        2<span className="text-emerald-400">(5 - y)</span> - y = 4
                    </motion.div>
                </div>
            )
        },
        {
            title: 'خطوة 3: الحل والعودة',
            detail: 'أصبحت المعادلة الثانية بمجهول واحد (y). نحلها، ثم نعود للقيمة المعزولة لنجد (x).',
            visual: (
                <div className="flex flex-col items-center gap-4 text-2xl font-mono" dir="ltr">
                    <div>10 - 2y - y = 4</div>
                    <div className="text-slate-400">-3y = -6  →  <span className="text-amber-400">y = 2</span></div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-4 pt-4 border-t border-slate-700 w-full text-center">
                        <div>x = 5 - <span className="text-amber-400">y</span></div>
                        <div className="text-emerald-400 font-black mt-2">x = 5 - 2 = 3</div>
                    </motion.div>
                </div>
            )
        }
    ];

    const handleCheckStep = async () => {
        let isCorrect = false;
        
        if (step === 0) {
            // Isolate x from eq1: x = ? - ?y
            if (parseInt(input1) === problem.c_isolated && parseInt(input2) === problem.b_isolated) isCorrect = true;
        } else if (step === 1) {
            // Inject: 3( ? - ?y ) - y = 10
            if (parseInt(input1) === problem.c_isolated && parseInt(input2) === problem.b_isolated) isCorrect = true;
        } else if (step === 2) {
            // Solve y: y = ?
            if (parseInt(input1) === problem.y) isCorrect = true;
        } else if (step === 3) {
            // Back sub: x = 8 - 2( ? )
            if (parseInt(input1) === problem.y) isCorrect = true;
        } else if (step === 4) {
            // Final x: x = ?
            if (parseInt(input1) === problem.x) isCorrect = true;
        }

        if (isCorrect) {
            setError(false);
            setInput1('');
            setInput2('');
            setShowHint(false);
            if (step < 4) {
                setStep(s => s + 1);
            } else {
                setStep(5);
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                try {
                    const data = await rewardService.claimLabReward('sys-subst-mastery');
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    const hints = [
        "انقل +2y إلى الطرف الآخر من المعادلة الأولى لتصبح x وحدها.",
        "ضع القيمة التي وجدتها (8 - 2y) بين قوسين بدلاً من حرف x.",
        "قم بنشر الرقم 3 على القوس، ثم اجمع قيم y معاً وحل المعادلة كالمعتاد.",
        "عوض قيمة y التي وجدتها (وهي 2) في العبارة المعزولة x = 8 - 2y.",
        "قم بحساب العملية الحسابية البسيطة: 8 ناقص (2 مضروبة في 2)."
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
                                <Layers size={16} /> طريقة التعويض
                            </div>
                            <h2 className={`text-base md:text-lg font-black leading-tight tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-white' : 'text-slate-900'}`}>حقن المتغيرات</h2>
                        </motion.div>
                    ) : (
                        <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 border ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {phase === 'learn' ? 'التحليل النظري' : step === 5 ? 'مكتمل' : `خطوة التدريب ${step + 1}/5`}
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
                                <Layers size={20} />
                            </div>
                            <p className={`${theme.textSub} text-sm md:text-base font-medium mb-3`}>تعلم كيف تعزل مجهولاً وتزرعه داخل المعادلة الأخرى لتحل الجملة ببساطة تامة.</p>
                            <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all text-lg">فتح الدليل التفاعلي</button>
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
                                 <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black transition-all flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && step < 5 && (
                    <div className="flex flex-col items-center w-full max-w-2xl px-2">
                        {/* The Problem Box */}
                        <div className={`w-full p-4 md:p-6 rounded-[1rem] border backdrop-blur-3xl mb-4 flex flex-col items-center justify-center gap-2 font-mono text-base md:text-lg ${theme.card} ${theme.textMain}`} dir="ltr">
                            <div className={step === 0 ? "text-emerald-400 font-black" : ""}>1) x + 2y = 8</div>
                            <div className={step === 1 ? "text-amber-400 font-black" : ""}>2) 3x - y = 10</div>
                        </div>

                        {/* Interactive Step Box */}
                        <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full p-4 md:p-6 rounded-[1rem] border shadow-2xl backdrop-blur-3xl flex flex-col items-center gap-4 ${theme.card}`}>
                            <div className={`text-sm md:text-base font-bold text-center ${theme.textSub}`}>
                                {step === 0 && "الخطوة 1: اعزل x من المعادلة (1) لتصبح وحدها في طرف"}
                                {step === 1 && "الخطوة 2: احقن العبارة التي وجدتها مكان x في المعادلة (2)"}
                                {step === 2 && "الخطوة 3: قم بنشر المعادلة الناتجة وحلها لإيجاد y"}
                                {step === 3 && "الخطوة 4: عُد لعبارة العزل (1) وعوض y بالقيمة التي وجدتها"}
                                {step === 4 && "الخطوة 5: احسب النتيجة النهائية لتجد x"}
                            </div>
                            
                            <div className="flex items-center justify-center gap-3 font-mono text-base md:text-lg mt-2 w-full" dir="ltr">
                                {step === 0 && (
                                    <>
                                        <span className="text-emerald-400 font-black">x = </span>
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="8" autoFocus />
                                        <span className="text-white">-</span>
                                        <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-16 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="2" />
                                        <span className="text-white">y</span>
                                    </>
                                )}
                                {step === 1 && (
                                    <>
                                        <span className="text-amber-400 font-black">3(</span>
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} className={`w-12 bg-black/60 border-2 rounded-xl text-center p-1 outline-none ${error ? 'border-rose-500' : 'border-amber-500/50 text-amber-400'}`} placeholder="8" autoFocus />
                                        <span className="text-white">-</span>
                                        <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-12 bg-black/60 border-2 rounded-xl text-center p-1 outline-none ${error ? 'border-rose-500' : 'border-amber-500/50 text-amber-400'}`} placeholder="2" />
                                        <span className="text-white mr-1">y) - y = 10</span>
                                    </>
                                )}
                                {step === 2 && (
                                    <>
                                        <span className="text-amber-400 font-black">y = </span>
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-20 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-amber-500/50 text-amber-400'}`} placeholder="?" autoFocus />
                                    </>
                                )}
                                {step === 3 && (
                                    <>
                                        <span className="text-emerald-400 font-black">x = 8 - 2(</span>
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-20 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="y" autoFocus />
                                        <span className="text-emerald-400 font-black">)</span>
                                    </>
                                )}
                                {step === 4 && (
                                    <>
                                        <span className="text-emerald-400 font-black">x = </span>
                                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheckStep()} className={`w-20 bg-black/60 border-2 rounded-xl text-center p-2 outline-none ${error ? 'border-rose-500 animate-shake' : 'border-emerald-500/50 text-emerald-400'}`} placeholder="?" autoFocus />
                                    </>
                                )}
                            </div>

                            <div className="w-full flex gap-2 mt-2">
                                <button onClick={() => setShowHint(!showHint)} className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center ${isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                                    <HelpCircle size={20} />
                                </button>
                                <button onClick={handleCheckStep} className="flex-grow py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2">
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

                {step === 5 && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center max-w-md px-2">
                        <MasteryRewardCard reward={reward} />
                        <button onClick={() => { setPhase('intro'); setStep(0); setInput1(''); setInput2(''); }} className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg">إنهاء المختبر</button>
                    </motion.div>
                )}
            </div>
            
            {phase !== 'intro' && step < 5 && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => { setPhase('intro'); setStep(0); setInput1(''); setInput2(''); }} className={`p-2 rounded-full backdrop-blur-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
