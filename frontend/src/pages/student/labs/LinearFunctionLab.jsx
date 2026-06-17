import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart,
    Calculator,
    MousePointer2,
    Search,
    RefreshCcw,
    Lightbulb,
    Zap,
    Target,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Layout
} from 'lucide-react';

export default function LinearFunctionLab() {
    // Mode: 'expression', 'image', 'preimage', 'graph', 'extraction'
    const [step, setStep] = useState(0);
    const [coeffA, setCoeffA] = useState(2);
    const [inputX, setInputX] = useState(3);
    const [inputY, setInputY] = useState(6);

    // For extraction mode
    const [pointX, setPointX] = useState(2);
    const [pointY, setPointY] = useState(4);

    const reset = () => {
        setStep(0);
        setCoeffA(2);
    };

    const steps = [
        {
            id: 'expression',
            title: '1. العبارة الجبرية',
            desc: 'الدالة الخطية هي علاقة تضرب كل عدد في معامل ثابت. نكتبها على الشكل f(x) = ax.',
            teacher: 'تخيل الدالة كآلة؛ تدخل x، تضربه في a، وتخرج النتيجة f(x). لا تنسَ: الدالة الخطية تمر دوماً من المبدأ (0,0).',
            render: () => (
                <div className="flex flex-col items-center gap-8 py-6">
                    <div className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">الصيغة العامة</div>
                        <span className="text-5xl font-black italic text-sky-400">f(x)</span>
                        <span className="text-4xl font-black">=</span>
                        <div className="flex flex-col items-center">
                            <input
                                type="number"
                                value={coeffA}
                                onChange={(e) => setCoeffA(parseFloat(e.target.value) || 0)}
                                className="w-24 bg-slate-800 border-2 border-sky-500/30 rounded-2xl p-4 text-center text-4xl font-black text-amber-400 focus:border-amber-400 outline-none transition-all"
                            />
                            <span className="text-[10px] font-bold text-slate-500 mt-2">المعامل (a)</span>
                        </div>
                        <span className="text-5xl font-black italic text-emerald-400 text-shadow-glow">x</span>
                    </div>

                    <div className="flex gap-4">
                        <div className={`px-6 py-4 rounded-2xl flex items-center gap-3 font-bold border-2 ${coeffA > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                            {coeffA > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            {coeffA > 0 ? 'دالة متزايدة (صعود)' : coeffA < 0 ? 'دالة متناقصة (هبوط)' : 'دالة ثابتة (منطبقة)'}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'image',
            title: '2. حساب صورة عدد',
            desc: 'لإيجاد صورة عدد، نقوم ببساطة بتعويض x في العبارة الجبرية.',
            teacher: 'القاعدة بسيطة: اضرب العدد المعطى في المعامل a. النتيجة هي الصورة.',
            render: () => (
                <div className="space-y-8 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-lg text-center">
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">أدخل العدد x</label>
                            <input
                                type="number"
                                value={inputX}
                                onChange={(e) => setInputX(parseFloat(e.target.value) || 0)}
                                className="w-32 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center text-3xl font-black text-slate-800"
                            />
                        </div>
                        <ArrowRight size={32} className="text-slate-300 hidden md:block" />
                        <div className="bg-sky-500 p-8 rounded-[2.5rem] shadow-xl text-white text-center min-w-[200px] border-4 border-sky-400">
                            <label className="block text-[10px] font-black text-sky-100 mb-2 uppercase tracking-widest">الصورة f({inputX})</label>
                            <div className="text-5xl font-black">{coeffA * inputX}</div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 text-center font-black text-xl italic text-slate-600">
                        f({inputX}) = {coeffA} × {inputX} = <span className="text-sky-600 underline decoration-sky-300 decoration-4 underline-offset-8">{coeffA * inputX}</span>
                    </div>
                </div>
            )
        },
        {
            id: 'preimage',
            title: '3. حساب عدد علمت صورته',
            desc: 'هنا نسأل: ما هو x الذي يعطينا هذه النتيجة؟ إنها عملية عكسية.',
            teacher: 'للحصول على x، نقوم بقسمة الصورة المعطاة على المعامل a. فكر فيها كحل للمعادلة ax = y.',
            render: () => (
                <div className="space-y-8 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="bg-emerald-500 p-8 rounded-[2.5rem] shadow-xl text-white text-center min-w-[200px] border-4 border-emerald-400">
                            <label className="block text-[10px] font-black text-emerald-100 mb-2 uppercase tracking-widest">أدخل الصورة y</label>
                            <input
                                type="number"
                                value={inputY}
                                onChange={(e) => setInputY(parseFloat(e.target.value) || 0)}
                                className="w-full bg-emerald-600/50 border-2 border-emerald-300 rounded-2xl p-2 text-center text-3xl font-black text-white focus:outline-none"
                            />
                        </div>
                        <ArrowRight size={32} className="text-slate-300 hidden md:block" />
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-lg text-center">
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">العدد x المطلوب</label>
                            <div className="text-4xl font-black text-slate-800">
                                {coeffA !== 0 ? (inputY / coeffA).toFixed(2).replace(/\.00$/, '') : '∞'}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 text-center font-black text-xl italic text-slate-600">
                        x = {inputY} ÷ {coeffA} = <span className="text-emerald-600 underline decoration-emerald-300 decoration-4 underline-offset-8">{coeffA !== 0 ? (inputY / coeffA).toFixed(2).replace(/\.00$/, '') : 'غير معرف'}</span>
                    </div>
                </div>
            )
        },
        {
            id: 'graph',
            title: '4. التمثيل البياني',
            desc: 'المستقيم يمر دوماً بنقطتين: المبدأ (0,0) ونقطة مساعدة تختارها أنت.',
            teacher: 'أسهل نقطة مساعدة هي النقطة (1, a). بما أن الدالة خطية، يكفي تحديد هذه النقطة ورسم الخط المنطلق من المبدأ إليها.',
            render: () => (
                <div className="flex flex-col lg:flex-row gap-8 items-center justify-center py-4">
                    <div className="bg-white p-4 rounded-3xl border-4 border-slate-100 shadow-2xl overflow-hidden">
                        <svg width="300" height="300" viewBox="-10 -10 20 20" className="transform rotate-180 scale-x-[-1]">
                            {/* Grid */}
                            <defs>
                                <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                                    <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#f1f5f9" strokeWidth="0.05" />
                                </pattern>
                            </defs>
                            <rect x="-10" y="-10" width="20" height="20" fill="url(#grid)" />

                            {/* Axes */}
                            <line x1="-10" y1="0" x2="10" y2="0" stroke="#cbd5e1" strokeWidth="0.1" />
                            <line x1="0" y1="-10" x2="0" y2="10" stroke="#cbd5e1" strokeWidth="0.1" />

                            {/* The Function Line */}
                            <line
                                x1="-10"
                                y1={-10 * coeffA}
                                x2="10"
                                y2={10 * coeffA}
                                stroke={coeffA >= 0 ? "#0ea5e9" : "#f43f5e"}
                                strokeWidth="0.2"
                                strokeLinecap="round"
                            />

                            {/* Points */}
                            <circle cx="0" cy="0" r="0.3" fill="#1e293b" />
                            <circle cx="1" cy={coeffA} r="0.3" fill="#f59e0b" />
                            <text x="1.5" y={coeffA} fontSize="0.8" fill="#1e293b" transform="scale(1, -1) translate(0, 0)"> (1, {coeffA})</text>
                        </svg>
                    </div>
                    <div className="space-y-4 max-w-xs">
                        <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-100 font-bold text-sky-700 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">1</div>
                            <span>المبدأ (0, 0)</span>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100 font-bold text-amber-700 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">2</div>
                            <span>نقطة مساعدة: (1, {coeffA})</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'extraction',
            title: '5. استخراج العبارة الجبرية',
            desc: 'إذا علمنا نقطة يمر منها المستقيم، يمكننا إيجاد المعامل a.',
            teacher: 'لإيجاد المعامل a، نقوم بقسمة ترتيب النقطة (y) على فاصلتها (x). أي: a = f(x) / x.',
            render: () => (
                <div className="space-y-8 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-lg text-center">
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">إحداثيات النقطة</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={pointX}
                                    onChange={(e) => setPointX(parseFloat(e.target.value) || 1)}
                                    className="w-20 bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black"
                                    placeholder="x"
                                />
                                <input
                                    type="number"
                                    value={pointY}
                                    onChange={(e) => setPointY(parseFloat(e.target.value) || 0)}
                                    className="w-20 bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-center font-black"
                                    placeholder="y"
                                />
                            </div>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white text-center min-w-[200px] border-4 border-slate-800">
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">المعامل الناتج (a)</label>
                            <div className="text-4xl font-black text-amber-400">
                                {pointX !== 0 ? (pointY / pointX).toFixed(2).replace(/\.00$/, '') : '∞'}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-100 text-center font-black text-xl italic text-amber-900">
                        a = {pointY} ÷ {pointX} = {pointX !== 0 ? (pointY / pointX).toFixed(2).replace(/\.00$/, '') : '؟'} → f(x) = {(pointX !== 0 ? (pointY / pointX).toFixed(2).replace(/\.00$/, '') : 'a')}x
                    </div>
                </div>
            )
        }
    ];

    const currentStep = steps[step];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-cairo" dir="rtl">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
                            <span className="w-14 h-14 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl shadow-sky-500/30">
                                <TrendingUp size={32} />
                            </span>
                            مختبر الدالة الخطية
                        </h1>
                        <p className="text-slate-500 font-bold mt-2">رحلة بصرية لاحتراف الدوال والتناسبية</p>
                    </div>

                    <button
                        onClick={reset}
                        className="flex items-center gap-2 text-slate-400 hover:text-sky-500 font-bold px-6 py-3 rounded-2xl hover:bg-sky-50 transition-all border-2 border-dashed border-slate-200"
                    >
                        <RefreshCcw size={20} />
                        إعادة الضبط
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Navigation Panel */}
                    <div className="lg:col-span-3 space-y-3">
                        {steps.map((s, idx) => (
                            <button
                                key={s.id}
                                onClick={() => setStep(idx)}
                                className={`w-full text-right p-4 rounded-2xl font-black transition-all flex items-center gap-3 border-2 ${step === idx ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20 scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-sky-100 hover:text-slate-600 shadow-sm'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step === idx ? 'bg-white/20' : 'bg-slate-50'}`}>
                                    {idx === 0 && <Calculator size={20} />}
                                    {idx === 1 && <MousePointer2 size={20} />}
                                    {idx === 2 && <Zap size={20} />}
                                    {idx === 3 && <LineChart size={20} />}
                                    {idx === 4 && <Search size={20} />}
                                </div>
                                <span>{s.title}</span>
                            </button>
                        ))}

                        <div className="mt-8 p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <h4 className="text-xs font-black text-sky-400 uppercase tracking-widest mb-3">تلميح ذكي 💡</h4>
                            <p className="text-slate-300 text-sm font-bold leading-loose">
                                هل تلاحظ أن الخط يمر دوماً بمنتصف الشبكة؟
                                هذا لأن f(0) = a × 0 = 0 دوماً في الدوال الخطية!
                            </p>
                        </div>
                    </div>

                    {/* Content Panel */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border-2 border-slate-100 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 py-2 px-10 bg-slate-50 rounded-bl-[2rem] border-b-2 border-l-2 border-slate-100 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إرشادات الأستاذ</span>
                                </div>

                                <div className="mb-10 pt-4">
                                    <h2 className="text-3xl font-black text-slate-800 mb-4">{currentStep.title}</h2>
                                    <p className="text-slate-500 font-bold text-lg leading-relaxed">{currentStep.desc}</p>
                                </div>

                                <div className="min-h-[300px] flex flex-col justify-center">
                                    {currentStep.render()}
                                </div>

                                {/* Teacher Quote Section */}
                                <div className="mt-12 p-8 bg-sky-50 rounded-[2.5rem] border-2 border-sky-100 flex gap-6 relative">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md shrink-0 border-2 border-sky-200">
                                        <Lightbulb className="text-sky-500" size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sky-800 text-xl mb-2">كيف نفهمها ببساطة؟</h4>
                                        <p className="text-sky-700/80 font-bold text-lg leading-loose italic">
                                            "{currentStep.teacher}"
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Pagination Buttons */}
                        <div className="mt-8 flex justify-between items-center px-4">
                            <button
                                onClick={() => setStep(s => Math.max(0, s - 1))}
                                disabled={step === 0}
                                className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-400 font-black hover:bg-slate-50 transition-all disabled:opacity-0"
                            >
                                السابق
                            </button>

                            <div className="flex gap-2">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-sky-500' : 'w-2 bg-slate-200'}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                                className={`px-10 py-4 rounded-2xl font-black shadow-lg shadow-sky-500/20 text-white transition-all ${step === steps.length - 1 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-sky-500 hover:bg-sky-600'}`}
                            >
                                {step === steps.length - 1 ? 'مبارك! أكملت الدرس' : 'الخطوة التالية'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
