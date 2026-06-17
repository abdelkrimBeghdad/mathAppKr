import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lightbulb, Send, RotateCcw, HelpCircle, ArrowLeft, BookOpen, Pencil, Calculator, Sparkles, Cpu, ChevronLeft } from 'lucide-react';
import MathText from '../MathText';
import confetti from 'canvas-confetti';

function computeSteps(a, b) {
    const steps = [];
    let x = a, y = b;
    while (y !== 0) {
        const r = x % y;
        steps.push({ a: x, b: y, q: Math.floor(x / y), remainder: r });
        x = y;
        y = r;
    }
    return { steps, pgcd: x };
}

export default function EuclideanAlgorithm({ initialA = 3356, initialB = 1528 }) {
    const { steps: expectedSteps, pgcd } = useMemo(() => computeSteps(initialA, initialB), [initialA, initialB]);

    const [phase, setPhase] = useState('learn'); // 'learn' or 'practice'
    const [learnStep, setLearnStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [completedRows, setCompletedRows] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [finished, setFinished] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const current = expectedSteps[currentStep];

    // Learn phase example (smaller numbers)
    const learnA = 48, learnB = 18;
    const { steps: learnSteps, pgcd: learnPgcd } = useMemo(() => computeSteps(learnA, learnB), []);

    const handleSubmit = () => {
        const val = parseInt(userAnswer);
        if (isNaN(val) || val < 0) {
            setFeedback({ type: 'error', text: 'أدخل عدداً طبيعياً صحيحاً.' });
            return;
        }

        if (val !== current.remainder) {
            const q = Math.floor(current.a / current.b);
            setFeedback({
                type: 'error',
                text: `باقي قسمة $${current.a}$ على $${current.b}$ ليس $${val}$. تذكر أن: $${current.a} = ${current.b} \\times ${q} + r$ حيث $r$ هو الباقي.`
            });
            return;
        }

        const newRow = { ...current };
        const newCompleted = [...completedRows, newRow];
        setCompletedRows(newCompleted);
        setUserAnswer('');
        setShowHint(false);

        if (current.remainder === 0) {
            setFinished(true);
            setFeedback({ type: 'trophy', text: `القاسم المشترك الأكبر هو: $PGCD(${initialA}; ${initialB}) = ${pgcd}$` });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        } else {
            setCurrentStep(currentStep + 1);
            setFeedback({
                type: 'success',
                text: `$${current.a} = ${current.b} \\times ${Math.floor(current.a / current.b)} + ${current.remainder}$ ✓`
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
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-slate-950 rounded-[1.5rem] p-4 md:p-6 border border-white/10 shadow-3xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-right">
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-500/20 text-indigo-300 rounded-full font-black text-sm uppercase tracking-widest mb-3 border border-indigo-500/30 backdrop-blur-md">
                            <Cpu size={16} /> خوارزمية إقليدس الذكية
                        </div>
                        <h2 className="text-base md:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white leading-tight tracking-tighter">حساب الـ PGCD</h2>
                        <p className="text-slate-400 mt-4 text-sm md:text-base font-medium max-w-xl italic leading-relaxed">استخدم بروتوكول القسمات المتتالية لاكتشاف القاسم المشترك الأكبر بأقصى دقة تقنية.</p>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => { setPhase('learn'); setLearnStep(0); handleReset(); }}
                            className={`px-4 py-2 rounded-[1rem] font-black transition-all flex items-center justify-center gap-3 text-lg ${phase === 'learn' ? 'bg-indigo-600 text-white shadow-glow' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'}`}
                        >
                            <BookOpen size={22} /> تعلّم الخوارزمية
                        </button>
                        <button 
                            onClick={() => { setPhase('practice'); handleReset(); }}
                            className={`px-4 py-2 rounded-[1rem] font-black transition-all flex items-center justify-center gap-3 text-lg ${phase === 'practice' ? 'bg-emerald-600 text-white shadow-glow' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'}`}
                        >
                            <Pencil size={22} /> ممارسة التدريب
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'learn' ? (
                    <motion.div 
                        key="learn" 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-8"
                    >
                        <div className="bg-slate-900/60 backdrop-blur-3xl border-2 border-white/5 rounded-[1.5rem] p-5 shadow-3xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
                                <div className="flex-grow space-y-8 w-full">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                                        <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-4">
                                            <Sparkles className="text-indigo-400 w-10 h-10" /> مثال توضيحي: <MathText text={`$PGCD(${learnA};${learnB})$`} />
                                        </h3>
                                        <div className="px-5 py-2 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-300 uppercase tracking-widest border border-indigo-500/20">Learning Protocol Active</div>
                                    </div>

                                    <div className="space-y-6">
                                        {learnSteps.slice(0, learnStep + 1).map((s, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 40 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`p-8 rounded-[1.5rem] border-2 transition-all duration-500 ${s.remainder === 0 ? 'bg-emerald-500/10 border-emerald-500/40 shadow-glow-emerald' : 'bg-slate-950 border-white/5 shadow-inner'}`}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <MathText text={`$${s.a} = ${s.b} \\times ${s.q} + {\\color{${s.remainder === 0 ? '#10b981' : '#f43f5e'}}{${s.remainder}}}$`} className="font-mono font-black text-base md:text-lg text-white block tracking-tighter" />
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.remainder === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-indigo-400'}`}>
                                                        {s.remainder === 0 ? <Trophy size={20} /> : <span className="font-black">#{i+1}</span>}
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-white/5">
                                                    {s.remainder !== 0 ? (
                                                        <MathText text={`← الباقي $r = ${s.remainder}$، نواصل العملية بـ $PGCD(${s.b}; ${s.remainder})$`} className="text-slate-400 text-base md:text-lg font-medium block" />
                                                    ) : (
                                                        <MathText text={`← الباقي $r = 0$! إذن $PGCD(${learnA}; ${learnB}) = ${learnPgcd}$ 🎉`} className="text-emerald-400 text-xl font-black block italic" />
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="flex justify-center pt-8">
                                        {learnStep < learnSteps.length - 1 ? (
                                            <button
                                                onClick={() => setLearnStep(learnStep + 1)}
                                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-[1.5rem] font-black shadow-3xl transition-all text-2xl flex items-center justify-center gap-4 hover:scale-[1.02]"
                                            >
                                                القسمة التالية <ChevronLeft size={20} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setPhase('practice')}
                                                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-[1.5rem] font-black shadow-3xl transition-all text-2xl flex items-center justify-center gap-4 hover:scale-[1.02]"
                                            >
                                                <Pencil size={20} /> ابدأ التحدي الحقيقي
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full lg:w-96 bg-slate-950/80 p-5 rounded-[1.5rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
                                    <div className="text-indigo-400 font-black text-xl mb-3 flex items-center gap-3 underline decoration-indigo-500/40 underline-offset-[12px]">
                                        <Lightbulb size={28} /> منطق الخوارزمية
                                    </div>
                                    <div className="space-y-6">
                                        <MathText text="تعتمد طريقة إقليدس على القاعدة الذهبية: $PGCD(a;b) = PGCD(b;\\ r)$ حيث $r$ هو باقي القسمة الإقليدية لـ $a$ على $b$." className="text-slate-200 font-medium leading-relaxed block text-lg" />
                                        <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/20">
                                            <p className="text-indigo-300 text-sm font-black uppercase tracking-widest mb-3">الهدف النهائي:</p>
                                            <p className="text-slate-400 text-base leading-relaxed italic font-medium">نكرر هذه الخطوة حتى نصل إلى باقي يساوي $0$. عندها يكون آخر باقٍ غير معدوم هو القاسم المشترك الأكبر.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="practice" 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -30 }}
                        className="space-y-10"
                    >
                        <div className="bg-slate-950 border-2 border-white/5 rounded-[1.5rem] overflow-hidden shadow-3xl relative">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            <div className="bg-slate-900/80 p-5 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-xl relative z-10">
                                <h3 className="text-xl font-black text-white flex items-center gap-3">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-glow"><Calculator size={20} /></div>
                                    حساب: <MathText text={`$PGCD(${initialA};${initialB})$`} />
                                </h3>
                                <button onClick={handleReset} className="p-5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl transition-all border border-white/10 group">
                                    <RotateCcw size={28} className="group-hover:rotate-180 transition-transform duration-500" />
                                </button>
                            </div>

                            <div className="p-4 md:p-6 overflow-x-auto relative z-10">
                                <table className="w-full min-w-[600px] border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-slate-500 text-sm font-black uppercase tracking-[0.3em] text-center">
                                            <th className="py-3 px-6 italic opacity-70"><MathText text="$a$" /> (المقسوم)</th>
                                            <th className="py-3 px-6 italic opacity-70"><MathText text="$b$" /> (المقسوم عليه)</th>
                                            <th className="py-3 px-6 italic opacity-70">الباقي ($r$)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedRows.map((row, i) => (
                                            <motion.tr key={i} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                                                className={`rounded-[1.5rem] shadow-inner ${row.remainder === 0 ? 'bg-emerald-500/10' : 'bg-slate-900/50'}`}
                                            >
                                                <td className="py-10 px-8 text-center font-mono font-black text-xl text-white rounded-r-[2.5rem]">{row.a}</td>
                                                <td className="py-10 px-8 text-center font-mono font-black text-xl text-indigo-400">{row.b}</td>
                                                <td className={`py-10 px-8 text-center font-mono font-black text-xl rounded-l-[2.5rem] ${row.remainder === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{row.remainder}</td>
                                            </motion.tr>
                                        ))}
                                        {!finished && current && (
                                            <tr className="relative">
                                                <td colSpan="3" className="p-1">
                                                    <div className="bg-indigo-600/10 border-4 border-indigo-500/30 rounded-[1.5rem] p-5 flex flex-col md:flex-row items-center justify-between gap-5 shadow-3xl">
                                                        <div className="flex items-center gap-12 font-mono font-black text-2xl lg:text-xl text-white">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-4">Dividend</span>
                                                                {current.a}
                                                            </div>
                                                            <div className="text-slate-800 italic text-xl">=</div>
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs uppercase tracking-[0.4em] text-indigo-500/50 mb-4">Divisor</span>
                                                                <span className="text-indigo-400">{current.b}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs uppercase tracking-[0.4em] text-rose-500 mb-4">Enter Remainder</span>
                                                                <div className="flex items-center gap-4">
                                                                    <input 
                                                                        type="number" 
                                                                        value={userAnswer} 
                                                                        onChange={(e) => setUserAnswer(e.target.value)}
                                                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} 
                                                                        placeholder="r"
                                                                        className="w-16 md:w-24 bg-slate-950 border-4 border-rose-500/40 text-rose-400 rounded-3xl py-3 text-center font-mono font-black text-2xl lg:text-xl focus:border-rose-500 outline-none shadow-glow-rose transition-all" 
                                                                        autoFocus 
                                                                    />
                                                                    <button onClick={handleSubmit} className="p-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1rem] shadow-3xl transition-all active:scale-90 flex items-center justify-center">
                                                                        <Send size={20} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Analysis Footer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="bg-slate-950 border-2 border-white/5 rounded-[1.5rem] p-5 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-indigo-400 font-black text-xl flex items-center gap-3">
                                        <Lightbulb size={20} /> بروتوكول المساعدة
                                    </h4>
                                    <button 
                                        onClick={() => setShowHint(!showHint)}
                                        className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all underline decoration-white/10 underline-offset-8"
                                    >
                                        {showHint ? 'إغفاء البيانات' : 'تحليل القسمة'}
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {showHint ? (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                            <div className="p-8 bg-slate-900 rounded-[1.5rem] border border-white/5 shadow-inner leading-relaxed">
                                                <MathText
                                                    text={`اقسم $${current.a}$ على $${current.b}$: الحاصل هو $${current.q}$.\\\\ إذن: $${current.a} = ${current.b} \\times ${current.q} + r$\\\\ الباقي هو: $r = ${current.a} - (${current.b} \\times ${current.q}) = ${current.remainder}$`}
                                                    className="text-slate-300 font-medium block text-lg"
                                                />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <p className="text-slate-500 text-lg font-medium italic opacity-60 leading-relaxed">بإمكانك طلب "تحليل القسمة" للحصول على توضيح لعملية القسمة الإقليدية الحالية.</p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <AnimatePresence mode="wait">
                                {feedback ? (
                                    <motion.div 
                                        key={feedback.text} 
                                        initial={{ opacity: 0, x: -20 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        exit={{ opacity: 0, x: 20 }}
                                        className={`rounded-[1.5rem] p-5 flex items-center justify-center text-center border-4 shadow-3xl ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-glow-emerald' :
                                            feedback.type === 'trophy' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-glow-indigo' :
                                                'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-glow-rose'
                                            }`}
                                    >
                                        <div>
                                            {feedback.type === 'trophy' && <Trophy className="mx-auto mb-3 text-amber-500 animate-bounce" size={40} />}
                                            <MathText text={feedback.text} className="font-black text-base md:text-lg block tracking-tighter" />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="bg-slate-950 border-2 border-white/5 border-dashed rounded-[1.5rem] p-5 flex items-center justify-center">
                                        <p className="text-slate-700 font-black text-2xl italic tracking-[0.2em] opacity-40">PROCESSING INPUT...</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {finished && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-indigo-700 rounded-[1.5rem] p-16 text-white text-center shadow-glow-indigo relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                                <div className="relative z-10 space-y-10">
                                    <div className="w-32 h-32 bg-white/10 backdrop-blur-2xl rounded-[1.5rem] flex items-center justify-center mx-auto shadow-3xl border border-white/20 rotate-12">
                                        <Trophy size={20} className="text-amber-400 drop-shadow-glow" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl md:text-2xl font-black tracking-tighter italic">خبير في إقليدس!</h3>
                                        <div className="inline-block px-8 py-3 bg-emerald-500/20 text-emerald-300 rounded-full font-black text-sm uppercase tracking-widest border border-emerald-500/30">Mastery Achieved</div>
                                    </div>
                                    <div className="bg-black/40 backdrop-blur-3xl rounded-[1.5rem] p-12 border border-white/10 shadow-inner">
                                        <MathText text={`إذن: $PGCD(${initialA};${initialB}) = ${pgcd}$`} className="text-base md:text-lg font-black block tracking-tighter" />
                                        <p className="text-indigo-200 mt-4 text-xl font-medium opacity-80 leading-relaxed italic">خوارزمية القسمات المتتالية أثبتت نجاعتها مرة أخرى. أنت الآن مستعد لأرقام أكبر!</p>
                                    </div>
                                    <button onClick={handleReset} className="px-12 py-3 bg-white text-indigo-900 rounded-[1rem] font-black text-2xl shadow-3xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4 mx-auto group">
                                        <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-700" /> ممارسة جديدة
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
