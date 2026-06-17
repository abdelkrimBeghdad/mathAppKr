import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, AlertCircle, CheckCircle, Lightbulb, ArrowRight, RotateCcw, ChevronDown, Award, HelpCircle } from 'lucide-react';
import MathText from './MathText';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function EquationSolver({ onClose }) {
    const [equation, setEquation] = useState('2x + 6 = 10');
    const [mode, setMode] = useState('input'); // 'input', 'auto', 'guided'
    const [equationType, setEquationType] = useState('linear');
    const [error, setError] = useState('');

    // Results & State
    const [solution, setSolution] = useState(null);
    const [guidedSteps, setGuidedSteps] = useState([]);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [showHint, setShowHint] = useState(false);

    const parseLinear = (eq) => {
        const parts = eq.replace(/\s/g, '').split('=');
        if (parts.length !== 2) throw new Error('معادلة غير صحيحة. يرجى استخدام الصيغة: ax + b = c');

        const [left, right] = parts;
        const xMatch = left.match(/([+-]?\d*)x/);
        const constMatch = left.match(/([+-]\d+)(?!x)/);

        if (!xMatch) throw new Error('لم يتم العثور على المجهول x');

        const a = xMatch[1] === '' || xMatch[1] === '+' ? 1 : xMatch[1] === '-' ? -1 : parseFloat(xMatch[1]);
        const b = constMatch ? parseFloat(constMatch[1]) : 0;
        const c = parseFloat(right);

        if (isNaN(c)) throw new Error('الطرف الأيمن يجب أن يكون رقماً');

        return { a, b, c };
    };

    const parseQuadratic = (eq) => {
        const normalized = eq.replace(/\s/g, '').replace('=0', '').replace(/\^2/g, '²').replace(/x\*\*2/g, 'x²');
        const aMatch = normalized.match(/([+-]?\d*)x²/);
        const bMatch = normalized.match(/([+-]\d*)x(?!²)/);
        const cMatch = normalized.match(/([+-]\d+)(?!x)/);

        const a = aMatch ? (aMatch[1] === '' || aMatch[1] === '+' ? 1 : aMatch[1] === '-' ? -1 : parseFloat(aMatch[1])) : 0;
        const b = bMatch ? (bMatch[1] === '' || bMatch[1] === '+' ? 1 : bMatch[1] === '-' ? -1 : parseFloat(bMatch[1])) : 0;
        const c = cMatch ? parseFloat(cMatch[1]) : 0;

        if (a === 0) throw new Error('ليست معادلة من الدرجة الثانية');
        return { a, b, c };
    };

    const prepareSteps = () => {
        setError('');
        try {
            if (equation.includes('²') || equation.includes('^2') || equation.includes('x**2')) {
                const { a, b, c } = parseQuadratic(equation);
                const delta = b * b - 4 * a * c;
                const type = 'quadratic';

                const steps = [
                    {
                        title: 'تحديد المعاملات',
                        desc: `المعادلة هي: $${a}x^2 ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0$`,
                        val: null // No input needed for first step
                    },
                    {
                        title: 'حساب المميز $\\Delta$',
                        desc: 'احسب قيمة المميز $\\Delta$ باستخدام القاعدة: $\\Delta = b^2 - 4ac$',
                        targetVal: delta,
                        hint: `احسب: $(${b})^2 - 4 \\times (${a}) \\times (${c})$`
                    }
                ];

                if (delta < 0) {
                    steps.push({ title: 'النتيجة', desc: 'بما أن $\\Delta < 0$، فلا يوجد حل حقيقي للمعادلة.', val: null });
                    return { steps, type, result: { x1: null, x2: null, delta } };
                } else if (delta === 0) {
                    const x = -b / (2 * a);
                    steps.push({
                        title: 'حساب الحل المضاعف',
                        desc: 'بما أن $\\Delta = 0$، هناك حل واحد مضاعف: $x = \\dfrac{-b}{2a}$',
                        targetVal: parseFloat(x.toFixed(2)),
                        hint: `احسب: $\\dfrac{-(${b})}{2 \\times ${a}}$`
                    });
                    return { steps, type, result: { x1: x, x2: x, delta } };
                } else {
                    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
                    const x2 = (-b - Math.sqrt(delta)) / (2 * a);
                    steps.push({
                        title: 'حساب الحل الأول $x_1$',
                        desc: 'بما أن $\\Delta > 0$، هناك حلان. احسب $x_1 = \\dfrac{-b + \\sqrt{\\Delta}}{2a}$',
                        targetVal: parseFloat(x1.toFixed(2)),
                        hint: `احسب: $\\dfrac{-(${b}) + ${Math.sqrt(delta).toFixed(2)}}{${2 * a}}$`
                    });
                    steps.push({
                        title: 'حساب الحل الثاني $x_2$',
                        desc: 'احسب الحل الآخر: $x_2 = \\dfrac{-b - \\sqrt{\\Delta}}{2a}$',
                        targetVal: parseFloat(x2.toFixed(2)),
                        hint: `احسب: $\\dfrac{-(${b}) - ${Math.sqrt(delta).toFixed(2)}}{${2 * a}}$`
                    });
                    return { steps, type, result: { x1, x2, delta } };
                }
            } else {
                const { a, b, c } = parseLinear(equation);
                const type = 'linear';
                const steps = [
                    {
                        title: 'تبسيط المعادلة',
                        desc: `المعادلة في شكلها القياسي هي: $${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}$`,
                        val: null
                    },
                    {
                        title: 'عزل المجهول $x$',
                        desc: `ننقل الثابت $${b}$ للطرف الآخر (تتغير إشارته). كم يصبح الناتج في الطرف الأيمن؟`,
                        targetVal: c - b,
                        hint: `احسب: $${c} - (${b})$`
                    },
                    {
                        title: 'إيجاد الحل النهائي',
                        desc: `نقسم الطرفين على المعامل $${a}$. كم تبلغ قيمة $x$؟`,
                        targetVal: parseFloat(((c - b) / a).toFixed(2)),
                        hint: `احسب: $\\dfrac{${c - b}}{${a}}$`
                    }
                ];
                return { steps, type, result: { x: (c - b) / a } };
            }
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const startAuto = () => {
        const data = prepareSteps();
        if (!data) return;
        setEquationType(data.type);
        setGuidedSteps(data.steps);
        setSolution(data.result);
        setMode('auto');
    };

    const startGuided = () => {
        const data = prepareSteps();
        if (!data) return;
        setEquationType(data.type);
        setGuidedSteps(data.steps);
        setSolution(data.result);
        setCurrentStepIdx(0);
        setMode('guided');
        setUserInput('');
        setShowHint(false);
    };

    const checkStep = () => {
        const step = guidedSteps[currentStepIdx];
        if (step.targetVal === null || step.targetVal === undefined) {
            setCurrentStepIdx(prev => prev + 1);
            return;
        }

        if (parseFloat(userInput) === step.targetVal) {
            toast.success('إجابة صحيحة! أحسنت.');
            setUserInput('');
            setShowHint(false);
            if (currentStepIdx < guidedSteps.length - 1) {
                setCurrentStepIdx(prev => prev + 1);
            } else {
                handleComplete();
            }
        } else {
            toast.error('الرقم غير صحيح، حاول مرة أخرى.');
            setShowHint(true);
        }
    };

    const handleComplete = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const reset = () => {
        setMode('input');
        setSolution(null);
        setGuidedSteps([]);
        setError('');
        setUserInput('');
    };

    const generateGraphData = () => {
        if (!solution) return [];
        const data = [];
        const range = 10;

        try {
            if (equationType === 'linear') {
                const { a, b, c } = parseLinear(equation);
                for (let x = -range; x <= range; x += 0.5) {
                    data.push({ x, y: a * x + b - c });
                }
            } else {
                const { a, b, c } = parseQuadratic(equation);
                for (let x = -range; x <= range; x += 0.5) {
                    data.push({ x, y: a * x * x + b * x + c });
                }
            }
        } catch (e) { return []; }
        return data;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
            <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
                >
                    <X size={24} />
                </button>

                {/* Left Panel: Solver & Interaction */}
                <div className="w-full lg:w-[450px] border-e border-slate-100 flex flex-col bg-slate-50 relative z-10">
                    <div className="p-8 border-b border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                                <Calculator size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 font-cairo">حلال المعادلات الموجه</h2>
                        </div>
                        <p className="text-sm text-slate-500 font-bold">بناء الخطوات خطوة بخطوة لترسيخ الفهم.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {mode === 'input' ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-3 pr-2">أدخل المعادلة الرياضية</label>
                                    <input
                                        type="text"
                                        value={equation}
                                        onChange={(e) => setEquation(e.target.value)}
                                        className="w-full bg-white border-2 border-slate-200 rounded-[1.5rem] px-6 py-4 text-center font-mono text-xl focus:border-sky-500 outline-none shadow-inner"
                                        placeholder="مثال: 2x + 3 = 7"
                                        dir="ltr"
                                    />
                                    <div className="mt-3 flex gap-2">
                                        <button onClick={() => setEquation('2x + 6 = 10')} className="px-3 py-1 bg-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:bg-sky-100 hover:text-sky-600">خطي</button>
                                        <button onClick={() => setEquation('x² - 5x + 6 = 0')} className="px-3 py-1 bg-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:bg-sky-100 hover:text-sky-600">تربيعي</button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <button
                                        onClick={startGuided}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-5 rounded-[2rem] font-black text-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 border-b-4 border-emerald-700 active:border-b-0"
                                    >
                                        <Lightbulb size={24} />
                                        ابدأ وضع التعلم الموجه
                                    </button>
                                    <button
                                        onClick={startAuto}
                                        className="w-full bg-white border-2 border-slate-200 text-slate-700 px-6 py-4 rounded-[2rem] font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                                    >
                                        <RotateCcw size={20} className="text-sky-500" />
                                        الحل السريع المباشر
                                    </button>
                                </div>

                                {error && (
                                    <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-start gap-3">
                                        <AlertCircle className="text-rose-500 shrink-0" size={20} />
                                        <p className="text-sm text-rose-700 font-bold">{error}</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-400 uppercase">سير العمل الحالي</span>
                                    <button onClick={reset} className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-lg hover:bg-rose-100">تغيير المعادلة</button>
                                </div>

                                <div className="space-y-3">
                                    {guidedSteps.map((step, idx) => {
                                        const isVisible = mode === 'auto' || idx <= currentStepIdx;
                                        const isCompleted = mode === 'auto' || idx < currentStepIdx || (idx === currentStepIdx && currentStepIdx === guidedSteps.length - 1 && solution);

                                        if (!isVisible) return null;

                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={clsx(
                                                    "p-5 rounded-3xl border-2 transition-all",
                                                    isCompleted
                                                        ? "bg-white border-emerald-100 shadow-sm"
                                                        : "bg-white border-sky-500 shadow-lg shadow-sky-500/10"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={clsx(
                                                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black",
                                                        isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-sky-500 text-white"
                                                    )}>
                                                        {isCompleted ? <CheckCircle size={14} /> : idx + 1}
                                                    </span>
                                                    <MathText text={step.title} className={clsx("font-black text-sm", isCompleted ? "text-slate-400" : "text-slate-800")} />
                                                </div>
                                                <MathText text={step.desc} className="text-sm font-medium text-slate-600 leading-relaxed pr-10 block" />

                                                {/* Interaction Field if guided and current */}
                                                {mode === 'guided' && idx === currentStepIdx && step.targetVal !== undefined && step.targetVal !== null && (
                                                    <div className="mt-5 pr-10 space-y-4">
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="number"
                                                                value={userInput}
                                                                onChange={(e) => setUserInput(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && checkStep()}
                                                                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-center font-mono focus:border-sky-500 outline-none"
                                                                placeholder="ضع الناتج هنا..."
                                                            />
                                                            <button
                                                                onClick={checkStep}
                                                                className="bg-sky-500 text-white px-4 rounded-xl hover:bg-sky-600 transition-all shadow-md"
                                                            >
                                                                <ArrowRight size={20} />
                                                            </button>
                                                        </div>
                                                        {showHint && (
                                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                                <HelpCircle className="text-amber-500" size={16} />
                                                                <MathText text={step.hint} className="text-[10px] font-black text-amber-700 block" />
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {mode === 'guided' && currentStepIdx < guidedSteps.length && !guidedSteps[currentStepIdx].targetVal && (
                                    <button
                                        onClick={() => setCurrentStepIdx(prev => prev + 1)}
                                        className="w-full py-3 bg-slate-200 rounded-2xl font-black text-xs text-slate-600 hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
                                    >
                                        تابع الخطوة التالية <ChevronDown size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Visualization & Result */}
                <div className="flex-1 bg-white p-12 flex flex-col relative">
                    <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                    <div className="mb-10 text-right relative z-10">
                        <h2 className="text-4xl font-black text-slate-800 mb-2">التمثيل والتأكيد</h2>
                        <p className="font-bold text-slate-500 tracking-wide">الرسم البياني يوضح نقطة التقاطع مع المحورين.</p>
                    </div>

                    <div className="flex-1 min-h-[300px] bg-slate-50/50 rounded-[3rem] p-10 relative border-2 border-slate-100 mb-10 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={generateGraphData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="x" type="number" domain={[-10, 10]} stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                                <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }} />
                                <ReferenceLine x={0} stroke="#475569" strokeWidth={2} />
                                <ReferenceLine y={0} stroke="#475569" strokeWidth={2} />
                                <Line type="monotone" dataKey="y" stroke="#0ea5e9" strokeWidth={4} dot={false} strokeLinecap="round" />
                                {solution && (
                                    <>
                                        {solution.x !== undefined && (
                                            <ReferenceLine x={solution.x} stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" label={{ value: 'الحل', position: 'top', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                                        )}
                                        {solution.x1 !== undefined && solution.x1 !== null && (
                                            <ReferenceLine x={solution.x1} stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" label={{ value: 'x₁', position: 'top', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                                        )}
                                        {solution.x2 !== undefined && solution.x2 !== null && solution.x2 !== solution.x1 && (
                                            <ReferenceLine x={solution.x2} stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" label={{ value: 'x₂', position: 'top', fill: '#f43f5e', fontSize: 10, fontWeight: 'bold' }} />
                                        )}
                                    </>
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <AnimatePresence>
                        {solution && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="bg-gradient-to-tr from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
                                <div className="z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="text-amber-400" size={20} />
                                        <span className="text-xs font-black uppercase text-slate-400 tracking-widest">تحليل النتيجة النهائية</span>
                                    </div>
                                    <div className="flex items-center gap-6" dir="ltr">
                                        {equationType === 'linear' ? (
                                            <MathText text={`$x = ${solution.x.toFixed(2)}$`} className="text-5xl font-black text-emerald-400 block" />
                                        ) : (
                                            <div className="flex gap-8">
                                                {solution.x1 !== null ? (
                                                    <>
                                                        <div><MathText text="$x_1$" className="text-xs font-black text-slate-500 block mb-1" /><MathText text={`$${solution.x1.toFixed(2)}$`} className="text-4xl font-black text-emerald-400" /></div>
                                                        {solution.x1 !== solution.x2 && (
                                                            <div><MathText text="$x_2$" className="text-xs font-black text-slate-500 block mb-1" /><MathText text={`$${solution.x2.toFixed(2)}$`} className="text-4xl font-black text-rose-400" /></div>
                                                        )}
                                                    </>
                                                ) : <h3 className="text-3xl font-black text-rose-400">لا توجد حلول حقيقية</h3>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 z-10">
                                    <CheckCircle size={32} className="text-emerald-400" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
