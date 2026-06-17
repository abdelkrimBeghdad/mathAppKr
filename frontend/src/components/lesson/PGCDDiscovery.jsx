import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Send, Lightbulb, Trophy, AlertCircle, Plus, ArrowRight, BookOpen, Pencil, HelpCircle } from 'lucide-react';
import MathText from '../MathText';
import confetti from 'canvas-confetti';

function getDivisors(n) {
    const divs = [];
    for (let i = 1; i <= n; i++) {
        if (n % i === 0) divs.push(i);
    }
    return divs;
}

export default function PGCDDiscovery({ a = 45, b = 30 }) {
    const [phase, setPhase] = useState('learn');
    const [learnStep, setLearnStep] = useState(0);
    const [step, setStep] = useState(1);
    const [foundDivisorsA, setFoundDivisorsA] = useState([]);
    const [foundDivisorsB, setFoundDivisorsB] = useState([]);
    const [foundCommon, setFoundCommon] = useState([]);
    const [pgcdGuess, setPgcdGuess] = useState('');
    const [inputVal, setInputVal] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);

    const allDivisorsA = useMemo(() => getDivisors(a), [a]);
    const allDivisorsB = useMemo(() => getDivisors(b), [b]);
    const commonDivisors = useMemo(() => allDivisorsA.filter(d => allDivisorsB.includes(d)), [allDivisorsA, allDivisorsB]);
    const pgcd = useMemo(() => Math.max(...commonDivisors), [commonDivisors]);

    // Learn example
    const learnNum = 12;
    const learnDivisors = useMemo(() => getDivisors(learnNum), []);

    const learnContent = [
        { text: `لإيجاد قواسم العدد $${learnNum}$، نبحث عن كل عدد يقسمه بدون باقي.`, detail: `$${learnNum} \\div 1 = ${learnNum}$ ✓ إذن $1$ و $${learnNum}$ قاسمان.` },
        { text: `نجرب $2$: $${learnNum} \\div 2 = ${learnNum / 2}$ ✓`, detail: `إذن $2$ و $${learnNum / 2}$ قاسمان.` },
        { text: `نجرب $3$: $${learnNum} \\div 3 = ${learnNum / 3}$ ✓`, detail: `إذن $3$ و $${learnNum / 3}$ قاسمان.` },
        { text: `قواسم $${learnNum}$ هي: $\\{${learnDivisors.join(', ')}\\}$`, detail: 'الآن يمكنك البحث عن القواسم المشتركة بنفس الطريقة!' },
    ];

    const handleAddDivisor = () => {
        const val = parseInt(inputVal);
        if (isNaN(val) || val <= 0) {
            setFeedback({ type: 'error', text: 'أدخل عدداً طبيعياً صحيحاً.' });
            return;
        }

        if (step === 1) {
            if (a % val !== 0) {
                const q = Math.floor(a / val);
                const r = a % val;
                setFeedback({ type: 'error', text: `العدد $${val}$ ليس قاسماً لـ $${a}$ لأن: $${a} = ${val} \\times ${q} + {\\color{red}${r}}$.` });
                return;
            }
            if (foundDivisorsA.includes(val)) { setFeedback({ type: 'error', text: `$${val}$ موجود بالفعل!` }); return; }
            const newList = [...foundDivisorsA, val].sort((x, y) => x - y);
            setFoundDivisorsA(newList);
            setFeedback({ type: 'success', text: `$${val}$ قاسم لـ $${a}$ ✓` });
            setShowHint(false);
            if (newList.length === allDivisorsA.length) {
                setTimeout(() => { setStep(2); setFeedback({ type: 'info', text: `ممتاز! الآن ابحث عن قواسم $${b}$.` }); }, 800);
            }
        } else if (step === 2) {
            if (b % val !== 0) {
                const q = Math.floor(b / val);
                const r = b % val;
                setFeedback({ type: 'error', text: `العدد $${val}$ ليس قاسماً لـ $${b}$ لأن: $${b} = ${val} \\times ${q} + {\\color{red}${r}}$.` });
                return;
            }
            if (foundDivisorsB.includes(val)) { setFeedback({ type: 'error', text: `$${val}$ موجود بالفعل!` }); return; }
            const newList = [...foundDivisorsB, val].sort((x, y) => x - y);
            setFoundDivisorsB(newList);
            setFeedback({ type: 'success', text: `$${val}$ قاسم لـ $${b}$ ✓` });
            setShowHint(false);
            if (newList.length === allDivisorsB.length) {
                setTimeout(() => { setStep(3); setFeedback({ type: 'info', text: 'ممتاز! الآن حدد القواسم المشتركة.' }); }, 800);
            }
        } else if (step === 3) {
            if (!commonDivisors.includes(val)) { setFeedback({ type: 'error', text: `$${val}$ ليس قاسماً مشتركاً.` }); return; }
            if (foundCommon.includes(val)) { setFeedback({ type: 'error', text: `$${val}$ موجود بالفعل!` }); return; }
            const newList = [...foundCommon, val].sort((x, y) => x - y);
            setFoundCommon(newList);
            setFeedback({ type: 'success', text: `$${val}$ قاسم مشترك ✓` });
            setShowHint(false);
            if (newList.length === commonDivisors.length) {
                setTimeout(() => { setStep(4); setFeedback({ type: 'info', text: 'ما هو أكبر قاسم مشترك (PGCD)؟' }); }, 800);
            }
        }
        setInputVal('');
    };

    const handlePGCDGuess = () => {
        const val = parseInt(pgcdGuess);
        if (val === pgcd) {
            setStep(5);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            setFeedback({ type: 'trophy', text: `أحسنت! القاسم المشترك الأكبر هو: $PGCD(${a}; ${b}) = ${pgcd}$` });
        } else {
            setFeedback({ type: 'error', text: `ليس صحيحاً. ابحث عن أكبر عدد في مجموعة القواسم المشتركة: $\\{${commonDivisors.join(',\\, ')}\\}$` });
        }
    };

    // Get hint text based on current step
    const getHintText = () => {
        if (step === 1) {
            const missing = allDivisorsA.find(d => !foundDivisorsA.includes(d));
            return missing ? `جرب العدد $${missing}$: هل $${a} \\div ${missing}$ عدد صحيح؟` : '';
        }
        if (step === 2) {
            const missing = allDivisorsB.find(d => !foundDivisorsB.includes(d));
            return missing ? `جرب العدد $${missing}$: هل $${b} \\div ${missing}$ عدد صحيح؟` : '';
        }
        if (step === 3) {
            const missing = commonDivisors.find(d => !foundCommon.includes(d));
            return missing ? `العدد $${missing}$ يوجد في قواسم $${a}$ وقواسم $${b}$. هل هو قاسم مشترك؟` : '';
        }
        return '';
    };

    const stepLabels = [
        { num: 1, label: `قواسم $${a}$` }, { num: 2, label: `قواسم $${b}$` },
        { num: 3, label: 'المشتركة' }, { num: 4, label: 'PGCD' }, { num: 5, label: 'الخاصية' },
    ];
    const getStepColor = (s) => s < step ? 'bg-emerald-500 text-white' : s === step ? 'bg-sky-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400';

    // ==================== LEARN PHASE ====================
    if (phase === 'learn') {
        return (
            <div className="space-y-6" dir="rtl">
                <div className="p-5 bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border-2 border-sky-100 space-y-3">
                    <div className="flex items-center gap-2 text-sky-700 font-black text-lg">
                        <BookOpen size={22} />
                        <span>تعلّم الطريقة أولاً</span>
                    </div>
                    <MathText text="لإيجاد القاسم المشترك الأكبر (PGCD)، نبحث أولاً عن قواسم كل عدد، ثم نحدد القواسم المشتركة، وأكبرها هو PGCD." className="text-sky-600 font-medium block" />
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-xl space-y-5">
                    <h3 className="text-xl font-black text-slate-800 text-center">
                        <MathText text={`مثال: إيجاد قواسم العدد $${learnNum}$`} />
                    </h3>

                    <div className="space-y-3">
                        {learnContent.slice(0, learnStep + 1).map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                className="p-4 rounded-2xl border-2 bg-sky-50 border-sky-100">
                                <MathText text={item.text} className="font-bold text-lg block" dir="ltr" />
                                <MathText text={item.detail} className="text-slate-500 text-sm mt-1 font-medium block" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex gap-3 justify-center">
                        {learnStep < learnContent.length - 1 ? (
                            <button onClick={() => setLearnStep(learnStep + 1)}
                                className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold shadow-lg transition-all text-lg">
                                الخطوة التالية ←
                            </button>
                        ) : (
                            <button onClick={() => setPhase('practice')}
                                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg transition-all text-lg flex items-center gap-2">
                                <Pencil size={20} />
                                دورك الآن! أوجد PGCD({a};{b})
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ==================== PRACTICE PHASE ====================
    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
                    <Pencil size={16} />
                    دورك! أوجد PGCD({a};{b})
                </div>
                <button onClick={() => { setPhase('learn'); setLearnStep(0); }} className="px-3 py-2 bg-sky-100 text-sky-600 rounded-xl font-bold text-sm flex items-center gap-1 hover:bg-sky-200 transition-all">
                    <BookOpen size={14} />
                    راجع الطريقة
                </button>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between gap-1 px-2">
                {stepLabels.map((s, i) => (
                    <React.Fragment key={s.num}>
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${getStepColor(s.num)}`}>
                                {s.num < step ? <Check size={16} /> : s.num}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{s.label}</span>
                        </div>
                        {i < stepLabels.length - 1 && <div className={`flex-1 h-1 rounded-full transition-all ${s.num < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-xl space-y-6">
                {/* Steps 1-3: Input */}
                {(step >= 1 && step <= 3) && (
                    <div className="space-y-5">
                        <h3 className="text-xl font-black text-slate-800 text-center">
                            <MathText text={step === 1 ? `ابحث عن قواسم $${a}$` : step === 2 ? `ابحث عن قواسم $${b}$` : `حدد القواسم المشتركة لـ $${a}$ و $${b}$`} />
                        </h3>
                        <div className="flex gap-3">
                            <input type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddDivisor()} placeholder="أدخل عدداً..."
                                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-center font-bold text-lg focus:border-sky-500 outline-none" dir="ltr" />
                            <button onClick={handleAddDivisor} className="px-6 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                                <Plus size={20} /> أضف
                            </button>
                        </div>

                        {/* Hint */}
                        <div className="space-y-2">
                            <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-amber-600 font-bold text-sm hover:text-amber-700 transition-colors">
                                <HelpCircle size={16} />
                                {showHint ? 'إخفاء التلميح' : 'أحتاج تلميحاً 💡'}
                            </button>
                            <AnimatePresence>
                                {showHint && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-100">
                                        <MathText text={getHintText()} className="text-amber-800 font-medium block" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Display found sets */}
                        {foundDivisorsA.length > 0 && (
                            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                                <span className="text-xs font-bold text-sky-400 block mb-1">قواسم {a}: ({foundDivisorsA.length}/{allDivisorsA.length})</span>
                                <div className="flex flex-wrap gap-1.5">{foundDivisorsA.map(d => <span key={d} className="px-2.5 py-1 bg-sky-500 text-white rounded-lg font-bold text-sm">{d}</span>)}</div>
                            </div>
                        )}
                        {foundDivisorsB.length > 0 && (
                            <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
                                <span className="text-xs font-bold text-violet-400 block mb-1">قواسم {b}: ({foundDivisorsB.length}/{allDivisorsB.length})</span>
                                <div className="flex flex-wrap gap-1.5">{foundDivisorsB.map(d => <span key={d} className="px-2.5 py-1 bg-violet-500 text-white rounded-lg font-bold text-sm">{d}</span>)}</div>
                            </div>
                        )}
                        {foundCommon.length > 0 && (
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <span className="text-xs font-bold text-emerald-400 block mb-1">القواسم المشتركة: ({foundCommon.length}/{commonDivisors.length})</span>
                                <div className="flex flex-wrap gap-1.5">{foundCommon.map(d => <span key={d} className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg font-bold text-sm">{d}</span>)}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Guess PGCD */}
                {step === 4 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                        <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-200 text-center space-y-3">
                            <h3 className="text-xl font-black text-amber-800">ما هو القاسم المشترك الأكبر؟</h3>
                            <MathText text={`القواسم المشتركة: $\\{${commonDivisors.join(',\\, ')}\\}$`} className="text-amber-700 font-medium text-lg" />
                        </div>
                        <div className="flex gap-3 items-center justify-center">
                            <MathText text={`$PGCD(${a};${b}) = $`} className="text-xl font-bold" />
                            <input type="number" value={pgcdGuess} onChange={(e) => setPgcdGuess(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePGCDGuess()}
                                className="w-24 bg-white border-2 border-amber-300 rounded-xl p-3 text-center font-black text-2xl focus:border-amber-500 outline-none" dir="ltr" />
                            <button onClick={handlePGCDGuess} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg transition-all">
                                <Send size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 5: Result + Property */}
                {step === 5 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                        <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl text-white text-center space-y-3">
                            <Trophy size={20} className="mx-auto" />
                            <h3 className="text-2xl font-black"><MathText text={`$PGCD(${a};${b}) = ${pgcd}$`} /></h3>
                        </div>
                        <div className="p-5 bg-slate-900 rounded-2xl text-white space-y-4">
                            <div className="flex items-center gap-2 text-amber-400 font-bold"><Lightbulb size={20} /><span>خاصية:</span></div>
                            <MathText text="مجموعة القواسم المشتركة لعددين = مجموعة قواسم الـ PGCD" className="text-slate-300 font-medium block" />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-800 rounded-xl">
                                    <span className="text-xs text-emerald-400 font-bold block mb-1">القواسم المشتركة:</span>
                                    <div className="flex flex-wrap gap-1.5">{commonDivisors.map(d => <span key={d} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded font-bold text-sm">{d}</span>)}</div>
                                </div>
                                <div className="p-3 bg-slate-800 rounded-xl">
                                    <span className="text-xs text-amber-400 font-bold block mb-1">قواسم {pgcd}:</span>
                                    <div className="flex flex-wrap gap-1.5">{getDivisors(pgcd).map(d => <span key={d} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded font-bold text-sm">{d}</span>)}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Feedback */}
                <AnimatePresence mode="wait">
                    {feedback && step < 5 && (
                        <motion.div key={feedback.text} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className={`p-4 rounded-2xl border-2 ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                                feedback.type === 'info' ? 'bg-sky-50 border-sky-100 text-sky-800' :
                                    'bg-rose-50 border-rose-100 text-rose-800'
                                }`}>
                            <MathText text={feedback.text} className="font-medium" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
