import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Trophy, Lightbulb, Send, RotateCcw, HelpCircle, BookOpen, Pencil, Calculator, Sparkles, ChevronLeft } from 'lucide-react';
import MathText from '../MathText';
import confetti from 'canvas-confetti';

function computeSteps(a, b) {
    const steps = [];
    let x = Math.max(a, b), y = Math.min(a, b);
    while (y !== 0) {
        const diff = x - y;
        steps.push({ a: x, b: y, diff });
        if (diff > y) { x = diff; }
        else { x = y; y = diff; }
    }
    return steps;
}

export default function PGCDSubtraction({ initialA = 378, initialB = 315 }) {
    const expectedSteps = useMemo(() => computeSteps(initialA, initialB), [initialA, initialB]);
    const pgcd = expectedSteps.length > 0 ? expectedSteps[expectedSteps.length - 1].b : initialA;

    const [phase, setPhase] = useState('learn');
    const [learnStep, setLearnStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [completedRows, setCompletedRows] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [finished, setFinished] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const current = expectedSteps[currentStep];
    const learnSteps = useMemo(() => computeSteps(24, 18), []);
    const learnPgcd = learnSteps.length > 0 ? learnSteps[learnSteps.length - 1].b : 24;

    const handleSubmit = () => {
        const val = parseInt(userAnswer);
        if (isNaN(val)) {
            setFeedback({ type: 'error', text: 'أدخل عدداً صحيحاً.' });
            return;
        }
        if (val !== current.diff) {
            setFeedback({
                type: 'error',
                text: `$${current.a} - ${current.b} \\neq ${val}$. حاول مرة أخرى!`
            });
            return;
        }

        const newCompleted = [...completedRows, { ...current }];
        setCompletedRows(newCompleted);
        setUserAnswer('');
        setShowHint(false);

        if (current.diff === 0) {
            setFinished(true);
            setFeedback({ type: 'trophy', text: `القاسم المشترك الأكبر هو: $PGCD(${initialA}; ${initialB}) = ${pgcd}$` });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        } else {
            setCurrentStep(currentStep + 1);
            setFeedback({
                type: 'success',
                text: `$${current.a} - ${current.b} = ${current.diff}$ ✓`
            });
        }
    };

    const handleReset = () => {
        setCurrentStep(0);
        setUserAnswer('');
        setCompletedRows([]);
        setFeedback(null);
        setFinished(false);
        setShowHint(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 font-sans" dir="rtl">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[1.5rem] p-4 md:p-6 border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-500/10 blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="text-right">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full font-black text-xs uppercase tracking-widest mb-4 border border-indigo-500/20">
                            <Calculator size={14} /> خوارزمية الفوارق المتتالية
                        </div>
                        <h2 className="text-base md:text-lg font-black text-white tracking-tighter leading-tight">حساب الـ PGCD</h2>
                        <p className="text-slate-400 mt-2 text-lg font-medium italic">طريقة الطروحات المتتالية لاكتشاف القاسم المشترك الأكبر.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => { setPhase('learn'); setLearnStep(0); handleReset(); }}
                            className={`px-4 py-2 rounded-2xl font-black transition-all flex items-center gap-2 ${phase === 'learn' ? 'bg-indigo-600 text-white shadow-glow' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'}`}
                        >
                            <BookOpen size={18} /> تعلّم الطريقة
                        </button>
                        <button 
                            onClick={() => { setPhase('practice'); handleReset(); }}
                            className={`px-4 py-2 rounded-2xl font-black transition-all flex items-center gap-2 ${phase === 'practice' ? 'bg-emerald-600 text-white shadow-glow' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'}`}
                        >
                            <Pencil size={18} /> ممارسة التدريب
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'learn' ? (
                    <motion.div 
                        key="learn" 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-5 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent" />
                            <div className="relative z-10 flex flex-col md:flex-row gap-5 items-center">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-base md:text-lg font-black text-white flex items-center gap-3">
                                        <Sparkles className="text-indigo-400" /> مثال توضيحي: <MathText text={`$PGCD(24;18)$`} />
                                    </h3>
                                    <div className="space-y-4">
                                        {learnSteps.slice(0, learnStep + 1).map((s, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`p-6 rounded-[1rem] border-2 transition-all ${s.diff === 0 ? 'bg-emerald-500/10 border-emerald-500/30 shadow-glow-emerald' : 'bg-slate-950 border-white/5 shadow-inner'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <MathText text={`$${s.a} - ${s.b} = {\\color{${s.diff === 0 ? '#10b981' : '#818cf8'}}{${s.diff}}}$`} className="font-mono font-black text-base md:text-lg text-white block" />
                                                    {s.diff === 0 ? (
                                                        <span className="px-4 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">Success</span>
                                                    ) : (
                                                        <span className="px-4 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">Processing</span>
                                                    )}
                                                </div>
                                                <div className="mt-3">
                                                    {s.diff !== 0 ? (
                                                        <MathText text={`← الفرق $= ${s.diff}$، نواصل بالعددين $${s.b}$ و $${s.diff}$`} className="text-slate-400 text-sm font-medium block" />
                                                    ) : (
                                                        <MathText text={`← الفرق معدوم! إذن $PGCD = ${learnPgcd}$ 🎉`} className="text-emerald-400 text-base font-black block" />
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="flex justify-center pt-6">
                                        {learnStep < learnSteps.length - 1 ? (
                                            <button
                                                onClick={() => setLearnStep(learnStep + 1)}
                                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1rem] font-black shadow-3xl transition-all text-xl flex items-center justify-center gap-3"
                                            >
                                                الخطوة التالية <ChevronLeft size={20} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setPhase('practice')}
                                                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1rem] font-black shadow-3xl transition-all text-xl flex items-center justify-center gap-3"
                                            >
                                                <Pencil size={20} /> ابدأ الممارسة الآن
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full md:w-80 bg-slate-950 p-8 rounded-[1.5rem] border border-white/5 shadow-inner">
                                    <div className="text-indigo-400 font-black text-lg mb-4 flex items-center gap-2 underline decoration-indigo-500/30 underline-offset-8">
                                        <Lightbulb size={20} /> قاعدة الخوارزمية
                                    </div>
                                    <MathText text="تعتمد الطريقة على القاعدة: $PGCD(a;b) = PGCD(b;\\ a - b)$ نكرر عملية الطرح حتى نحصل على فرق يساوي $0$. آخر فرق غير معدوم هو القاسم المشترك الأكبر." className="text-slate-300 font-medium leading-relaxed block text-sm" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="practice" 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="bg-slate-900 border border-white/5 rounded-[1.5rem] overflow-hidden shadow-2xl">
                            <div className="bg-slate-800/50 p-8 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-2xl font-black text-white flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-glow"><Calculator size={20} /></div>
                                    حساب: <MathText text={`$PGCD(${initialA};${initialB})$`} />
                                </h3>
                                <button onClick={handleReset} className="p-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl transition-all border border-white/10">
                                    <RotateCcw size={22} />
                                </button>
                            </div>

                            <div className="p-4 md:p-6 overflow-x-auto">
                                <table className="w-full min-w-[500px]">
                                    <thead>
                                        <tr className="text-slate-500 text-sm font-black uppercase tracking-widest border-b border-white/5">
                                            <th className="py-3 px-4 text-center"><MathText text="$a$" /> (الأكبر)</th>
                                            <th className="py-3 px-4 text-center"><MathText text="$b$" /> (الأصغر)</th>
                                            <th className="py-3 px-4 text-center">الفرق ($a-b$)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {completedRows.map((row, i) => (
                                            <motion.tr key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                className={`${row.diff === 0 ? 'bg-emerald-500/5' : ''}`}
                                            >
                                                <td className="py-2 px-4 text-center font-mono font-black text-2xl text-white">{row.a}</td>
                                                <td className="py-2 px-4 text-center font-mono font-black text-2xl text-amber-400">{row.b}</td>
                                                <td className={`py-2 px-4 text-center font-mono font-black text-2xl ${row.diff === 0 ? 'text-emerald-400' : 'text-sky-400'}`}>{row.diff}</td>
                                            </motion.tr>
                                        ))}
                                        {!finished && current && (
                                            <tr className="bg-indigo-500/5 border-2 border-indigo-500/30 rounded-[1rem]">
                                                <td className="py-10 px-4 text-center font-mono font-black text-xl text-white">{current.a}</td>
                                                <td className="py-10 px-4 text-center font-mono font-black text-xl text-amber-400">{current.b}</td>
                                                <td className="py-10 px-4">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <input 
                                                            type="number" 
                                                            value={userAnswer} 
                                                            onChange={(e) => setUserAnswer(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} 
                                                            placeholder="?"
                                                            className="w-32 md:w-40 bg-slate-950 border-4 border-indigo-500/50 text-sky-400 rounded-2xl py-2 text-center font-mono font-black text-xl focus:border-indigo-500 outline-none shadow-inner" 
                                                            autoFocus 
                                                        />
                                                        <button onClick={handleSubmit} className="p-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-3xl transition-all active:scale-95">
                                                            <Send size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Hint & Feedback Footer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-900 border border-white/5 rounded-[1.5rem] p-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-indigo-400 font-black text-lg flex items-center gap-2">
                                        <Lightbulb size={20} /> هل تحتاج مساعدة؟
                                    </h4>
                                    <button 
                                        onClick={() => setShowHint(!showHint)}
                                        className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all underline decoration-white/10"
                                    >
                                        {showHint ? 'إخفاء التلميح' : 'عرض التلميح'}
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {showHint ? (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            <div className="p-6 bg-slate-950 rounded-2xl border border-white/5">
                                                <MathText text={`قم بحساب الفرق بين $${current.a}$ و $${current.b}$: $${current.a} - ${current.b} = \\text{؟}$`} className="text-slate-300 font-medium block" />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <p className="text-slate-500 text-sm font-medium italic">انقر على زر "عرض التلميح" إذا واجهت صعوبة في الحساب الذهني.</p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <AnimatePresence mode="wait">
                                {feedback ? (
                                    <motion.div 
                                        key={feedback.text} 
                                        initial={{ opacity: 0, scale: 0.95 }} 
                                        animate={{ opacity: 1, scale: 1 }} 
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`rounded-[1.5rem] p-8 flex items-center justify-center text-center border-2 ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                            feedback.type === 'trophy' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                                'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                            }`}
                                    >
                                        <div>
                                            {feedback.type === 'trophy' && <Trophy className="mx-auto mb-3 text-amber-500 animate-bounce" size={40} />}
                                            <MathText text={feedback.text} className="font-black text-base md:text-lg block" />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="bg-slate-900 border border-white/5 rounded-[1.5rem] p-8 flex items-center justify-center border-dashed">
                                        <p className="text-slate-600 font-black text-lg italic tracking-tighter opacity-50 underline decoration-slate-800">بانتظار إجابتك...</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {finished && (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-indigo-600 to-emerald-600 rounded-[1.5rem] p-12 text-white text-center shadow-3xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                <div className="relative z-10 space-y-6">
                                    <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto shadow-2xl border border-white/20">
                                        <Trophy size={56} className="text-amber-400 drop-shadow-glow" />
                                    </div>
                                    <h3 className="text-2xl md:text-xl font-black tracking-tighter italic">إنجاز رائع!</h3>
                                    <div className="bg-black/20 backdrop-blur-md rounded-[1rem] p-8 border border-white/10">
                                        <MathText text={`لقد وجدت أن: $PGCD(${initialA};${initialB}) = ${pgcd}$`} className="text-xl md:text-2xl font-black block" />
                                        <p className="text-indigo-100 mt-4 text-lg font-medium opacity-80">تذكر دائماً أن آخر فرق غير معدوم هو القاسم المشترك الأكبر.</p>
                                    </div>
                                    <button onClick={handleReset} className="px-10 py-5 bg-white text-indigo-700 rounded-full font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto">
                                        <RotateCcw size={20} /> تدريب جديد
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
