import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight, Lightbulb, Calculator, CheckCircle2, Award, ArrowRight, BookOpen, Target, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function NotationConverter({ onClose }) {
    const [input, setInput] = useState('45000');
    const [mode, setMode] = useState('toScientific'); // 'toScientific' or 'toStandard'
    const [uiMode, setUiMode] = useState('input'); // 'input', 'guided', 'auto'
    const [result, setResult] = useState(null);

    // Guided State
    const [currentStep, setCurrentStep] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [showHint, setShowHint] = useState(false);

    const getScientificData = (numStr) => {
        const n = parseFloat(numStr);
        if (isNaN(n)) return null;
        const exponent = Math.floor(Math.log10(Math.abs(n)));
        const coefficient = n / Math.pow(10, exponent);
        return {
            original: numStr,
            coefficient: parseFloat(coefficient.toFixed(3)),
            exponent,
            notation: `${coefficient.toFixed(3)} × 10^${exponent}`
        };
    };

    const getStandardData = (notation) => {
        let coefficient, exponent;
        try {
            if (notation.includes('×') || notation.includes('*')) {
                const parts = notation.split(/[×*]/);
                coefficient = parseFloat(parts[0]);
                const expPart = parts[1].replace(/\s/g, '');
                const match = expPart.match(/-?\d+/);
                exponent = match ? parseInt(match[0]) : 0;
            } else if (notation.toLowerCase().includes('e')) {
                const parts = notation.toLowerCase().split('e');
                coefficient = parseFloat(parts[0]);
                exponent = parseInt(parts[1]);
            } else {
                return null;
            }
            return {
                notation,
                coefficient,
                exponent,
                value: coefficient * Math.pow(10, exponent)
            };
        } catch (e) { return null; }
    };

    const startGuided = () => {
        const data = mode === 'toScientific' ? getScientificData(input) : getStandardData(input);
        if (!data) {
            toast.error('يرجى إدخال صيغة صحيحة أولاً');
            return;
        }
        setResult(data);
        setUiMode('guided');
        setCurrentStep(0);
        setUserInput('');
        setShowHint(false);
    };

    const handleAuto = () => {
        const data = mode === 'toScientific' ? getScientificData(input) : getStandardData(input);
        if (!data) {
            toast.error('يرجى إدخال صيغة صحيحة أولاً');
            return;
        }
        setResult(data);
        setUiMode('auto');
    };

    const checkGuidedStep = () => {
        if (mode === 'toScientific') {
            if (currentStep === 0) { // Asking for exponent
                if (parseInt(userInput) === result.exponent) {
                    toast.success('مذهل! الأس صحيح.');
                    setCurrentStep(1);
                    setUserInput('');
                    setShowHint(false);
                } else {
                    toast.error('الأس غير صحيح. عد المنازل المزاحة.');
                    setShowHint(true);
                }
            } else { // Asking for coefficient
                if (parseFloat(userInput) === result.coefficient) {
                    completeGuided();
                } else {
                    toast.error('القيمة العشرية غير دقيقة. تأكد من وضع الفاصلة بعد أول رقم غير منعدم.');
                    setShowHint(true);
                }
            }
        } else { // toStandard
            if (parseFloat(userInput) === result.value) {
                completeGuided();
            } else {
                toast.error('الناتج غير صحيح. تذكر إزاحة الفاصلة حسب قيمة الأس.');
                setShowHint(true);
            }
        }
    };

    const completeGuided = () => {
        toast.success('إجابة نموذجية! لقد أتقنت التحويل.');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setUiMode('auto');
    };

    const reset = () => {
        setUiMode('input');
        setResult(null);
        setUserInput('');
    };

    const examples = mode === 'toScientific'
        ? ['45000', '0.0032', '1234.56', '0.00078']
        : ['4.5×10^4', '3.2×10^-3', '1.23e3', '7.8×10^-4'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4"
        >
            <div className="bg-white w-full max-w-5xl h-full max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
                >
                    <X size={24} />
                </button>

                {/* Left Side: Input & Steps */}
                <div className="w-full lg:w-[450px] bg-slate-50 border-e border-slate-200 flex flex-col p-8 overflow-y-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                                <Calculator size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 font-cairo">رحلة الكتابة العلمية</h2>
                        </div>
                        <p className="text-sm font-bold text-slate-500 pr-2">حول الأرقام الكبيرة والصغيرة جداً بدقة رياضية.</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {uiMode === 'input' ? (
                            <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="flex bg-slate-200 p-2 rounded-2xl gap-2">
                                    <button
                                        onClick={() => setMode('toScientific')}
                                        className={clsx("flex-1 py-3 rounded-xl font-black text-xs transition-all", mode === 'toScientific' ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 opacity-60")}
                                    >عادي ← علمي</button>
                                    <button
                                        onClick={() => setMode('toStandard')}
                                        className={clsx("flex-1 py-3 rounded-xl font-black text-xs transition-all", mode === 'toStandard' ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 opacity-60")}
                                    >علمي ← عادي</button>
                                </div>

                                <div className="p-6 bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm">
                                    <label className="text-xs font-black text-slate-400 block mb-4 pr-1">القيمة الأساسية</label>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="w-full text-center text-3xl font-mono font-black border-b-4 border-slate-100 pb-2 focus:border-sky-500 transition-all outline-none"
                                        placeholder={mode === 'toScientific' ? "45000" : "4.5×10^4"}
                                        dir="ltr"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {examples.map((ex, i) => (
                                        <button key={i} onClick={() => setInput(ex)} className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 hover:border-sky-200 hover:text-sky-600 transition-all" dir="ltr">{ex}</button>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-4">
                                    <button
                                        onClick={startGuided}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 border-b-4 border-emerald-700 active:border-b-0"
                                    >
                                        <BookOpen size={24} /> ابدأ تعلم التحويل
                                    </button>
                                    <button onClick={handleAuto} className="w-full py-4 text-slate-400 font-black text-xs hover:text-slate-600">أظهر التحويل المباشر السريع</button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="steps" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-black text-slate-400 uppercase">مراحل الحل التفاعلية</span>
                                    <button onClick={reset} className="p-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all"><RotateCcw size={16} /></button>
                                </div>

                                <div className="space-y-4">
                                    {uiMode === 'guided' && (
                                        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[40px] rounded-full" />
                                            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                                <Target size={14} /> الخطوة {currentStep + 1}
                                            </div>
                                            <h4 className="text-lg font-bold leading-relaxed">
                                                {mode === 'toScientific'
                                                    ? (currentStep === 0 ? `حدد قيمة الأس (الرتبة): في العدد ${input}، كم مرتبة سيزاح الرقم؟` : `والآن ما هو الجزء العشري المتبقي؟ (a حيث 1 ≤ a < 10)`)
                                                    : `حول العبارة ${input} إلى كتابة عشرية قياسية.`
                                                }
                                            </h4>

                                            <div className="relative pt-4">
                                                <input
                                                    type="text"
                                                    value={userInput}
                                                    onChange={(e) => setUserInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && checkGuidedStep()}
                                                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 text-center font-mono text-2xl font-black text-white outline-none focus:border-sky-500 transition-all"
                                                    placeholder="؟"
                                                />
                                                <button onClick={checkGuidedStep} className="absolute left-3 top-[calc(1rem+3.25rem/2)] -translate-y-1/2 p-3 bg-sky-500 text-white rounded-xl shadow-lg hover:bg-sky-600 active:scale-95 transition-all"><ArrowRight size={20} /></button>
                                            </div>

                                            {showHint && (
                                                <div className="flex gap-2 text-amber-300 text-[10px] font-black italic pr-2">
                                                    <Lightbulb size={14} className="shrink-0" />
                                                    {mode === 'toScientific'
                                                        ? (currentStep === 0 ? "تلميح: إذا كان العدد كبيراً فالأس موجب، وإذا كان عشرياً صغيراً جداً فالأس سالب." : `تلميح: الناتج يجب أن يكون ${result?.coefficient}`)
                                                        : "تلميح: الأس الموجب يعني حركة الفاصلة لليمين، والسالب لليسار."
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {uiMode === 'auto' && (
                                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 bg-emerald-500 rounded-[3rem] text-white text-center shadow-2xl shadow-emerald-500/20">
                                            <Award size={48} className="mx-auto mb-4" />
                                            <h3 className="text-3xl font-black mb-2">إنجاز رائع!</h3>
                                            <p className="text-sm font-bold opacity-90 mb-6">لقد أكملت عملية التحويل بنجاح.</p>
                                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                                                <span className="text-[10px] font-black uppercase opacity-60 block mb-2">النتيجة النهائية</span>
                                                <div className="text-3xl font-mono font-black" dir="ltr">{mode === 'toScientific' ? result?.notation : result?.value}</div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Side: Visual Sandbox */}
                <div className="flex-1 bg-white p-12 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                    <div className="w-full max-w-md space-y-12 relative z-10">
                        <div className="text-center space-y-2">
                            <h3 className="text-4xl font-black text-slate-800">مختبر القوى</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">قوة الأساس 10 والترميز العلمي</p>
                        </div>

                        <div className="relative group">
                            {/* Decorative Rings */}
                            <div className="absolute inset-0 bg-sky-500/5 blur-[80px] rounded-full scale-150" />

                            <div className="relative bg-slate-900 p-12 rounded-[4rem] text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-slate-800">
                                <motion.div key={input} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-8">
                                    <div className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">عالم الأرقام</div>
                                    <div className="text-5xl font-mono font-black text-white break-all" dir="ltr">{input}</div>

                                    <div className="flex items-center justify-center gap-4">
                                        <div className="h-[2px] w-12 bg-slate-700 rounded-full" />
                                        <ArrowLeftRight className="text-sky-400 animate-pulse" size={24} />
                                        <div className="h-[2px] w-12 bg-slate-700 rounded-full" />
                                    </div>

                                    {(uiMode === 'auto' || (uiMode === 'guided' && isCorrect)) && result && (
                                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3">
                                            <div className="text-emerald-400 text-6xl font-mono font-black" dir="ltr">
                                                {mode === 'toScientific' ? result.notation : result.value}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الكتابة المكافئة</div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Floaties */}
                            <div className="absolute -top-6 -right-6 w-20 h-20 bg-violet-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 rotate-12">
                                <span className="text-2xl font-black text-violet-600">10ⁿ</span>
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-sky-500/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 -rotate-12">
                                <Calculator className="text-sky-600" size={32} />
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-start gap-4">
                            <Lightbulb className="text-sky-500 shrink-0 mt-1" size={20} />
                            <div>
                                <h5 className="font-black text-slate-800 text-sm mb-1">تذكر دوماً</h5>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">الكتابة العلمية تهدف لتسهيل قراءة الأعداد الكبيرة جداً أو الصغيرة جداً عبر حصرها كجداء لعدد عشري واحد وقوة للعدد 10.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
