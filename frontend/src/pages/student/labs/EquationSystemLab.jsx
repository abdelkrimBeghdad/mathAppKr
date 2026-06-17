import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Divide,
    Minus,
    Plus,
    ChevronRight,
    RefreshCcw,
    Lightbulb,
    Zap,
    Target,
    ArrowRightLeft,
    Delete
} from 'lucide-react';

// Help helper for coefficient display
const formatCoeff = (c, varName, isFirst = false) => {
    if (c === 0) return null;
    let sign = c > 0 ? (isFirst ? '' : '+ ') : '- ';
    let absC = Math.abs(c);
    let val = absC === 1 ? '' : absC;
    return (
        <span className="inline-flex items-center">
            <span className="text-slate-400 font-bold mr-1">{sign}</span>
            <span className="text-slate-800 font-black">{val}{varName}</span>
        </span>
    );
};

export default function EquationSystemLab() {
    // Mode: 'substitution' or 'elimination'
    const [mode, setMode] = useState('substitution');
    const [step, setStep] = useState(0);

    // Initial equations: ax + by = c
    const [eq1, setEq1] = useState({ a: 1, b: 1, c: 5 });
    const [eq2, setEq2] = useState({ a: 2, b: -1, c: 1 });

    const [isolationVar, setIsolationVar] = useState(null); // 'x' or 'y'

    // Reset Lab
    const reset = () => {
        setStep(0);
        setIsolationVar(null);
    };

    // Auto-detect best variable for isolation
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (mode === 'substitution') {
            if (Math.abs(eq1.a) === 1) setIsolationVar('x');
            else if (Math.abs(eq1.b) === 1) setIsolationVar('y');
            else if (Math.abs(eq2.a) === 1) setIsolationVar('x');
            else if (Math.abs(eq2.b) === 1) setIsolationVar('y');
            else setIsolationVar('x');
        }
    }, [mode, eq1, eq2]);

    const steps = {
        substitution: [
            {
                title: 'البحث عن "المتغير الحر"',
                desc: 'افحص المعادلتين وابحث عن مجهول معامله 1 أو -1. هذا المجهول هو الأسهل للعزل.',
                render: () => (
                    <div className="space-y-4">
                        <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">1</div>
                                <div className="text-xl font-bold italic">
                                    {formatCoeff(eq1.a, 'x', true)} {formatCoeff(eq1.b, 'y')} = <span className="text-emerald-600 font-black">{eq1.c}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">2</div>
                                <div className="text-xl font-bold italic">
                                    {formatCoeff(eq2.a, 'x', true)} {formatCoeff(eq2.b, 'y')} = <span className="text-emerald-600 font-black">{eq2.c}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sky-600 font-bold bg-sky-50 p-4 rounded-xl">
                            <Lightbulb size={20} />
                            <span>نصيحة: المجهول {isolationVar} في المعادلة {Math.abs(eq1[isolationVar]) === 1 ? 'الأولى' : 'الثانية'} هو الأنسب!</span>
                        </div>
                    </div>
                )
            },
            {
                title: 'عزل المجهول',
                desc: `قم بنقل جميع العناصر الأخرى للطرف الآخر لنحصل على قيمة ${isolationVar} بدلالة المجهول الثاني.`,
                render: () => {
                    const selectedEq = Math.abs(eq1[isolationVar]) === 1 ? eq1 : eq2;
                    const otherVar = isolationVar === 'x' ? 'y' : 'x';
                    const otherCoeff = isolationVar === 'x' ? selectedEq.b : selectedEq.a;

                    return (
                        <div className="flex flex-col items-center gap-6 py-8">
                            <motion.div
                                layoutId="isolation"
                                className="text-3xl font-black text-slate-800 bg-white p-6 rounded-3xl shadow-xl border-4 border-sky-500"
                            >
                                {isolationVar} = <span className="text-emerald-600">{selectedEq.c}</span> {formatCoeff(-otherCoeff, otherVar)}
                            </motion.div>
                            <p className="text-slate-500 font-bold">رائع! الآن لدينا "مفتاح" الحل.</p>
                        </div>
                    );
                }
            },
            {
                title: 'عملية التعويض السحرية',
                desc: `الآن، خذ قيمة ${isolationVar} التي وجدتها و"ازرعها" في المعادلة الثانية مكان المجهول.`,
                render: () => {
                    const targetEq = Math.abs(eq1[isolationVar]) === 1 ? eq2 : eq1;
                    const selectedEq = Math.abs(eq1[isolationVar]) === 1 ? eq1 : eq2;
                    const otherVar = isolationVar === 'x' ? 'y' : 'x';
                    const otherCoeff = isolationVar === 'x' ? selectedEq.b : selectedEq.a;

                    return (
                        <div className="space-y-6">
                            <div className="text-xl font-bold text-center p-4 bg-slate-50 rounded-2xl">
                                نأخذ المعادلة: {formatCoeff(targetEq.a, 'x', true)} {formatCoeff(targetEq.b, 'y')} = {targetEq.c}
                            </div>
                            <div className="flex justify-center items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-6 rounded-3xl bg-sky-50 border-2 border-sky-200 text-2xl font-black text-sky-700"
                                >
                                    {targetEq[isolationVar === 'x' ? 'a' : 'b']}( <span className="text-rose-500">{selectedEq.c} - ({otherCoeff}){otherVar}</span> ) {formatCoeff(targetEq[isolationVar === 'x' ? 'b' : 'a'], otherVar)} = {targetEq.c}
                                </motion.div>
                            </div>
                        </div>
                    );
                }
            }
        ],
        elimination: [
            {
                title: 'تجهيز "المقابلة"',
                desc: 'نهدف لجعل معاملات أحد المجهولين متساوية ومتعاكسة في الإشارة ليتم حذفهما عند الجمع.',
                render: () => (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 flex flex-col items-center">
                                <span className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">معاملات x</span>
                                <div className="text-2xl font-black text-sky-500">
                                    {eq1.a} <ArrowRightLeft className="inline mx-2 text-slate-200" size={16} /> {eq2.a}
                                </div>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 flex flex-col items-center">
                                <span className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">معاملات y</span>
                                <div className="text-2xl font-black text-emerald-500">
                                    {eq1.b} <ArrowRightLeft className="inline mx-2 text-slate-200" size={16} /> {eq2.b}
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-100 flex items-start gap-3">
                            <Zap className="text-amber-500 shrink-0" size={20} />
                            <p className="text-amber-800 font-bold text-sm">تلميح: إذا ضربنا المعادلة الأولى في 2، ستصبح معاملات y متناظرة (-2 و 2)!</p>
                        </div>
                    </div>
                )
            },
            {
                title: 'عملية الدمج (الجمع)',
                desc: 'نجمع المعادلتين طرفاً لطرف. لاحظ كيف سيختفي المجهول المستهدف تماماً.',
                render: () => (
                    <div className="flex flex-col items-center py-6">
                        <div className="w-full max-w-xs space-y-2 text-2xl font-black italic relative">
                            <div className="text-right border-b-4 border-slate-200 pb-2 mb-2">
                                <div>{eq1.a}x + {eq1.b}y = {eq1.c}</div>
                                <div>{eq2.a}x + {eq2.b}y = {eq2.c}</div>
                                <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-slate-300">
                                    <Plus size={40} />
                                </div>
                            </div>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-right text-sky-600"
                            >
                                {eq1.a + eq2.a}x + <span className="text-rose-500 line-through">0y</span> = {eq1.c + eq2.c}
                            </motion.div>
                        </div>
                    </div>
                )
            }
        ]
    };

    const currentStep = steps[mode][step];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-cairo" dir="rtl">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
                            <span className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                                <ArrowRightLeft size={28} />
                                <Divide size={28} />
                            </span>
                            مختبر جملة معادلتين
                        </h1>
                        <p className="text-slate-500 font-bold mt-2">اتقن طرق التعويض والجمع بخطوات تفاعلية ذكية</p>
                    </div>

                    <div className="bg-white p-2 rounded-[1.5rem] shadow-xl border-2 border-slate-100 flex gap-2">
                        <button
                            onClick={() => { setMode('substitution'); reset(); }}
                            className={`px-6 py-3 rounded-xl font-black transition-all ${mode === 'substitution' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            طريقة التعويض
                        </button>
                        <button
                            onClick={() => { setMode('elimination'); reset(); }}
                            className={`px-6 py-3 rounded-xl font-black transition-all ${mode === 'elimination' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            طريقة الجمع
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Panel: Equation Editor */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-2 border-slate-100">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Target className="text-sky-500" />
                                تحكم في المعادلات
                            </h3>

                            <div className="space-y-8">
                                {/* Equation 1 inputs */}
                                <div className="space-y-4">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">المعادلة الأولى</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="number"
                                            value={eq1.a}
                                            onChange={(e) => setEq1({ ...eq1, a: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black focus:border-sky-500 outline-none transition-all"
                                            placeholder="a"
                                        />
                                        <input
                                            type="number"
                                            value={eq1.b}
                                            onChange={(e) => setEq1({ ...eq1, b: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black focus:border-sky-500 outline-none transition-all"
                                            placeholder="b"
                                        />
                                        <input
                                            type="number"
                                            value={eq1.c}
                                            onChange={(e) => setEq1({ ...eq1, c: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-xl p-3 text-center font-black focus:border-emerald-500 outline-none transition-all"
                                            placeholder="c"
                                        />
                                    </div>
                                </div>

                                {/* Equation 2 inputs */}
                                <div className="space-y-4">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">المعادلة الثانية</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="number"
                                            value={eq2.a}
                                            onChange={(e) => setEq2({ ...eq2, a: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black focus:border-sky-500 outline-none transition-all"
                                            placeholder="a"
                                        />
                                        <input
                                            type="number"
                                            value={eq2.b}
                                            onChange={(e) => setEq2({ ...eq2, b: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black focus:border-sky-500 outline-none transition-all"
                                            placeholder="b"
                                        />
                                        <input
                                            type="number"
                                            value={eq2.c}
                                            onChange={(e) => setEq2({ ...eq2, c: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-xl p-3 text-center font-black focus:border-emerald-500 outline-none transition-all"
                                            placeholder="c"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={reset}
                                className="w-full mt-8 flex items-center justify-center gap-2 text-slate-400 hover:text-sky-500 font-bold p-3 rounded-xl hover:bg-sky-50 transition-all border-2 border-dashed border-slate-100"
                            >
                                <RefreshCcw size={18} />
                                إعادة تعيين المختبر
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Guided Steps */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border-2 border-slate-100 h-full flex flex-col">
                            <div className="mb-8 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-xs font-black">الخطوة {step + 1} من {steps[mode].length}</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800">{currentStep.title}</h2>
                                    <p className="text-slate-500 font-bold mt-2 text-lg">{currentStep.desc}</p>
                                </div>
                            </div>

                            <div className="flex-grow flex flex-col justify-center min-h-[300px]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${mode}-${step}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ type: "spring", damping: 20 }}
                                    >
                                        {currentStep.render()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="mt-12 flex justify-between items-center bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                                <button
                                    onClick={() => setStep(Math.max(0, step - 1))}
                                    disabled={step === 0}
                                    className="flex items-center gap-2 text-slate-400 font-black px-6 py-3 rounded-xl hover:bg-white transition-all disabled:opacity-0"
                                >
                                    <ChevronRight className="rotate-180" size={20} />
                                    الخطوة السابقة
                                </button>

                                <div className="flex gap-2">
                                    {steps[mode].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-sky-500' : 'w-2 bg-slate-200'}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => setStep(Math.min(steps[mode].length - 1, step + 1))}
                                    className={`flex items-center gap-2 font-black px-8 py-4 rounded-2xl transition-all ${step === steps[mode].length - 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'}`}
                                >
                                    {step === steps[mode].length - 1 ? 'أنهيت التعلم!' : 'الخطوة التالية'}
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
