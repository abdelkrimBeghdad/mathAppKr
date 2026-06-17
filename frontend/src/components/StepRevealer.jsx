import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft } from 'lucide-react';
import MathText from './MathText';
import { useTheme } from '../context/ThemeContext';

export default function StepRevealer({ steps }) {
    const { isDark } = useTheme();
    const [visibleSteps, setVisibleSteps] = useState(0);

    const showNextStep = () => {
        if (visibleSteps < steps.length) {
            setVisibleSteps(prev => prev + 1);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-4">
                <AnimatePresence>
                    {steps.slice(0, visibleSteps).map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`p-6 md:p-8 rounded-[2rem] border-2 flex flex-col gap-4 mb-6 last:mb-0 relative transition-all ${step.type === 'stop'
                                ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/50 shadow-xl shadow-rose-500/5'
                                : step.type === 'notes'
                                    ? 'bg-sky-50/30 dark:bg-sky-900/10 border-sky-100 dark:border-sky-900/30 shadow-sm border-dashed'
                                    : `${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`
                                }`}
                        >
                            {step.type === 'stop' && (
                                <div className="absolute -right-3 -top-3 px-6 py-2 bg-rose-600 text-white text-sm font-black rounded-2xl shadow-2xl animate-bounce border-2 border-white z-10">
                                    نتوقف هنا! ✋
                                </div>
                            )}

                            {step.type === 'notes' && (
                                <div className="text-rose-600 font-black text-sm mb-1 border-b border-rose-100 pb-1 inline-block w-fit">
                                    ملاحظات:
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                {step.type !== 'notes' && (
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${step.type === 'stop'
                                        ? 'bg-rose-100 text-rose-600 border-rose-200'
                                        : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                                        }`}>
                                        <Check size={16} className="stroke-[3]" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <MathText
                                        text={typeof step === 'string' ? step : step.text}
                                        className={`${step.type === 'notes' ? (isDark ? 'text-slate-200' : 'text-slate-800') : (isDark ? 'text-slate-300' : 'text-slate-700')} font-bold text-lg leading-relaxed`}
                                    />

                                    {typeof step === 'object' && step.hint && (
                                        <div className="mt-2">
                                            <button
                                                onClick={(e) => {
                                                    const hintId = `hint-${index}`;
                                                    const el = document.getElementById(hintId);
                                                    if (el) el.classList.toggle('hidden');
                                                }}
                                                className={`text-xs font-bold flex items-center gap-1 transition-colors bg-white px-2 py-1 rounded-lg border ${step.type === 'stop'
                                                    ? 'text-rose-600 border-rose-100 hover:text-rose-700'
                                                    : 'text-sky-600 border-sky-100 hover:text-sky-700'
                                                    }`}
                                            >
                                                <span>💡 ملاحظة / تلميح</span>
                                            </button>
                                            <div id={`hint-${index}`} className={`hidden mt-3 p-4 rounded-2xl border-t-0 shadow-inner text-sm animate-in fade-in slide-in-from-top-2 border-r-4 ${step.type === 'stop'
                                                ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200'
                                                : 'border-sky-400 bg-sky-50 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200'
                                                }`}>
                                                <MathText text={step.hint} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {visibleSteps < steps.length ? (
                <button
                    onClick={showNextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl transition-all font-bold shadow-lg shadow-sky-500/20 group hover:-translate-y-1 active:translate-y-0"
                >
                    <span>الخطوة التالية</span>
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
            ) : (
                <div className={`p-6 ${isDark ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} border-2 rounded-2xl text-center font-black text-xl shadow-lg shadow-emerald-500/5`}>
                    ✨ انتهى المثال! لننتقل إلى التطبيق.
                </div>
            )}
        </div>
    );
}
