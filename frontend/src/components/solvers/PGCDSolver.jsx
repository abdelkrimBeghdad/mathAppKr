import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowRight, RefreshCw, Hash, Lightbulb, CheckCircle2, ChevronDown, RotateCcw, Award } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useTheme } from '../../context/ThemeContext';

export default function PGCDSolver() {
    const { isDark } = useTheme();
    const [num1, setNum1] = useState('');
    const [num2, setNum2] = useState('');

    // Modes: 'input', 'guided', 'auto'
    const [mode, setMode] = useState('input');

    const [steps, setSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [result, setResult] = useState(null);

    // Interactive inputs for guided mode
    const [guessA, setGuessA] = useState('');
    const [guessB, setGuessB] = useState('');
    const [showHint, setShowHint] = useState(false);

    // Calculate all steps internally
    const calculateAllSteps = (a, b) => {
        let currentSteps = [];
        let tempA = Math.abs(parseInt(a));
        let tempB = Math.abs(parseInt(b));

        if (tempB > tempA) {
            [tempA, tempB] = [tempB, tempA];
        }

        while (tempB !== 0) {
            let quotient = Math.floor(tempA / tempB);
            let remainder = tempA % tempB;
            currentSteps.push({
                a: tempA,
                b: tempB,
                q: quotient,
                r: remainder
            });
            tempA = tempB;
            tempB = remainder;
        }

        // Add final step where r is 0 and b is 0 just to mark end mathematically if needed, or we stop at r=0.
        return { calculatedSteps: currentSteps, finalResult: tempA };
    };

    const startAutoSolve = () => {
        if (!num1 || !num2) return;
        const { calculatedSteps, finalResult } = calculateAllSteps(num1, num2);
        setSteps(calculatedSteps);
        setResult(finalResult);
        setMode('auto');
    };

    const startGuidedSolve = () => {
        if (!num1 || !num2) return;
        const { calculatedSteps, finalResult } = calculateAllSteps(num1, num2);
        setSteps(calculatedSteps);
        setResult(finalResult);
        setCurrentStepIndex(0); // Show only step 0 initially
        setMode('guided');
        setGuessA('');
        setGuessB('');
        setShowHint(false);
    };

    const checkGuess = () => {
        const nextStep = steps[currentStepIndex + 1];
        if (!nextStep) {
            // Already finished
            handleCompletion();
            return;
        }

        if (parseInt(guessA) === nextStep.a && parseInt(guessB) === nextStep.b) {
            // Correct guess!
            toast.success('إجابة صحيحة! أحسنت الاستنتاج.');
            setCurrentStepIndex(prev => prev + 1);
            setGuessA('');
            setGuessB('');
            setShowHint(false);

            // Check if we just reached the end
            if (currentStepIndex + 1 === steps.length - 1) {
                handleCompletion();
            }
        } else {
            // Wrong guess
            toast.error('حاول مرة أخرى! تذكر القاعدة.');
            setShowHint(true);
        }
    };

    const handleCompletion = () => {
        setCurrentStepIndex(steps.length - 1); // Ensure all are shown
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
        });
    };

    const reset = () => {
        setNum1('');
        setNum2('');
        setSteps([]);
        setResult(null);
        setMode('input');
        setCurrentStepIndex(0);
        setGuessA('');
        setGuessB('');
        setShowHint(false);
    };

    return (
        <div className={clsx("rounded-[2.5rem] p-8 shadow-xl border space-y-8", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Hash size={24} />
                </div>
                <div>
                    <h3 className={clsx("text-2xl font-black", isDark ? "text-slate-100" : "text-slate-800")}>حاسبة PGCD (وضع التعلم الموجه)</h3>
                    <p className={clsx("text-sm font-bold mt-1", isDark ? "text-slate-400" : "text-slate-500")}>تعتمد على خوارزمية إقليدس (القسمات المتتالية)</p>
                </div>
            </div>

            {mode === 'input' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className={clsx("text-sm font-black mr-2", isDark ? "text-slate-300" : "text-slate-400")}>العدد الأول (a)</label>
                            <input
                                type="number"
                                value={num1}
                                onChange={(e) => setNum1(e.target.value)}
                                className={clsx("w-full border-2 rounded-2xl px-6 py-4 text-xl font-bold focus:border-indigo-500 transition-all outline-none", isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-100")}
                                placeholder="مثلاً: 105"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={clsx("text-sm font-black mr-2", isDark ? "text-slate-300" : "text-slate-400")}>العدد الثاني (b)</label>
                            <input
                                type="number"
                                value={num2}
                                onChange={(e) => setNum2(e.target.value)}
                                className={clsx("w-full border-2 rounded-2xl px-6 py-4 text-xl font-bold focus:border-indigo-500 transition-all outline-none", isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-100")}
                                placeholder="مثلاً: 45"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={startGuidedSolve}
                            disabled={!num1 || !num2}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-5 rounded-[2rem] font-black text-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 border-emerald-700 active:border-b-0"
                        >
                            <Lightbulb size={24} />
                            ابدأ التعلم الموجه
                        </button>
                        <button
                            onClick={startAutoSolve}
                            disabled={!num1 || !num2}
                            className={clsx("flex-1 py-5 rounded-[2rem] font-black text-xl transition-all active:scale-95 flex items-center justify-center gap-3 border-2 border-b-4 active:border-b-2 disabled:opacity-50", isDark ? "bg-slate-700 text-white border-slate-600" : "bg-white text-slate-800 border-slate-200")}
                        >
                            <Calculator size={24} className="text-indigo-500" />
                            الحل السريع المباشر
                        </button>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {(mode === 'guided' || mode === 'auto') && steps.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className={clsx("p-6 rounded-[2rem] mb-6 flex items-center justify-between", isDark ? "bg-indigo-900/20 border border-indigo-800/50" : "bg-indigo-50/50 border border-indigo-100")}>
                            <div className="flex items-center gap-3">
                                <span className={clsx("font-black text-xl", isDark ? "text-indigo-300" : "text-indigo-800")}>المساواة المعبرة عن القسمة الإقليدية:</span>
                            </div>
                            <div className="text-xl font-black font-mono tracking-widest text-slate-400 text-left ltr" dir="ltr">
                                a = b × q + r
                            </div>
                        </div>

                        <div className="space-y-4">
                            {steps.map((step, i) => {
                                // In guided mode, only show up to currentStepIndex
                                if (mode === 'guided' && i > currentStepIndex) return null;

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={clsx("flex flex-col sm:flex-row items-center gap-4 p-5 rounded-3xl border-2 transition-all", isDark ? "bg-slate-900/50 border-slate-700" : "bg-white border-slate-100 shadow-sm")}
                                    >
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <span className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner", isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")}>م {i + 1}</span>
                                            {i === 0 && mode === 'guided' && (
                                                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800">مثال توضيحي</span>
                                            )}
                                        </div>

                                        <div className="text-2xl font-black flex-1 text-center sm:text-left ltr font-mono tracking-wider w-full" dir="ltr">
                                            <span className="text-indigo-500">{step.a}</span>
                                            <span className={isDark ? "text-slate-400" : "text-slate-300"}> = </span>
                                            <span className="text-sky-500">{step.b}</span>
                                            <span className={isDark ? "text-slate-400" : "text-slate-300"}> × </span>
                                            <span className="text-amber-500">{step.q}</span>
                                            <span className={isDark ? "text-slate-400" : "text-slate-300"}> + </span>
                                            <span className={clsx(step.r === 0 ? "text-emerald-500 shadow-emerald-500/50 drop-shadow-md" : "text-rose-500", "font-black")}>{step.r}</span>
                                        </div>

                                        {step.r === 0 && (
                                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl font-bold border border-emerald-100 dark:border-emerald-800 shrink-0">
                                                <CheckCircle2 size={20} /> الباقي صفر!
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Interactive Prompting Field */}
                        {mode === 'guided' && currentStepIndex < steps.length - 1 && steps[currentStepIndex].r !== 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={clsx("p-8 rounded-[2rem] border-2 border-dashed mt-8 space-y-6 text-center", isDark ? "bg-slate-800/50 border-sky-800" : "bg-sky-50/50 border-sky-200")}
                            >
                                <div className="flex justify-center text-sky-500 mb-2 animate-bounce">
                                    <ChevronDown size={32} />
                                </div>
                                <h4 className={clsx("text-xl font-black", isDark ? "text-sky-300" : "text-sky-800")}>
                                    الآن دورك! ما هو المقسوم (a) والقاسم (b) للخطوة التالية؟
                                </h4>

                                <div className="flex flex-wrap items-center justify-center gap-4 text-2xl font-black font-mono tracking-widest ltr pt-4" dir="ltr">
                                    <input
                                        type="number"
                                        value={guessA}
                                        onChange={e => setGuessA(e.target.value)}
                                        className={clsx("w-28 h-16 text-center rounded-2xl border-b-4 focus:outline-none transition-all placeholder:text-sm placeholder:font-sans", isDark ? "bg-slate-900 border-indigo-700 text-indigo-400 focus:border-indigo-500" : "bg-white border-indigo-200 text-indigo-600 focus:border-indigo-500")}
                                        placeholder="a القادم"
                                    />
                                    <span className={isDark ? "text-slate-500" : "text-slate-300"}>=</span>
                                    <input
                                        type="number"
                                        value={guessB}
                                        onChange={e => setGuessB(e.target.value)}
                                        className={clsx("w-28 h-16 text-center rounded-2xl border-b-4 focus:outline-none transition-all placeholder:text-sm placeholder:font-sans", isDark ? "bg-slate-900 border-sky-700 text-sky-400 focus:border-sky-500" : "bg-white border-sky-200 text-sky-600 focus:border-sky-500")}
                                        placeholder="b القادم"
                                    />
                                    <span className={isDark ? "text-slate-600" : "text-slate-200"}>× q + r</span>
                                </div>

                                {showHint && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 inline-flex items-center gap-2 px-4 py-2 rounded-xl mt-4 border border-amber-200 dark:border-amber-800">
                                        <Lightbulb size={20} />
                                        تلميح: المقسوم الجديد هو القاسم السابق (b)، والقاسم الجديد هو الباقي السابق (r).
                                    </motion.div>
                                )}

                                <div className="pt-4 flex justify-center gap-4">
                                    <button
                                        onClick={checkGuess}
                                        disabled={!guessA || !guessB}
                                        className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
                                    >
                                        تحقق من الإجابة <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Final Result Display */}
                        {((mode === 'guided' && currentStepIndex === steps.length - 1) || mode === 'auto') && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-8 bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] text-center text-white shadow-xl shadow-emerald-500/30 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full pointer-events-none" />
                                <span className="font-black text-sm uppercase tracking-widest text-emerald-100 flex items-center justify-center gap-2 mb-4">
                                    <Award size={20} /> النتيجة النهائية
                                </span>
                                <h4 className="text-5xl md:text-6xl font-black mb-6">PGCD({num1}, {num2}) = {result}</h4>
                                <p className="font-bold text-emerald-100">
                                    القاسم المشترك الأكبر هو آخر باقٍ غير معدوم (في الخطوة ما قبل الأخيرة).
                                </p>
                            </motion.div>
                        )}

                        <div className="flex justify-center mt-8">
                            <button
                                onClick={reset}
                                className={clsx("px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-colors", isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                            >
                                <RotateCcw size={20} /> حاول بأرقام جديدة
                            </button>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
