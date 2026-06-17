import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MathText from '../MathText';
import clsx from 'clsx';

/**
 * مكوّن تحويل المعادلات المتحرك
 * يعرض الانتقال من تعبير رياضي إلى آخر مع شارة العملية
 */
export default function MathAnimation({
    steps,
    autoPlay = false,
    autoPlayDelay = 2000,
    onComplete,
    className,
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);

    useEffect(() => {
        if (!isPlaying || !steps || currentIndex >= steps.length - 1) return;

        const timer = setTimeout(() => {
            setCurrentIndex(prev => {
                const next = prev + 1;
                if (next >= steps.length - 1) {
                    setIsPlaying(false);
                    onComplete?.();
                }
                return next;
            });
        }, autoPlayDelay);

        return () => clearTimeout(timer);
    }, [isPlaying, currentIndex, steps, autoPlayDelay, onComplete]);

    if (!steps || steps.length === 0) return null;

    const currentStep = steps[currentIndex];
    const nextStep = steps[currentIndex + 1];
    const hasNext = currentIndex < steps.length - 1;
    const hasPrev = currentIndex > 0;

    return (
        <div className={clsx('space-y-4', className)}>
            {/* المعادلة الحالية */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`math-${currentIndex}`}
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="relative"
                >
                    {/* بطاقة المعادلة */}
                    <div className="p-5 md:p-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200/60 dark:border-slate-600/40 shadow-lg animate-math-glow">
                        <MathText
                            text={`$$${currentStep.expression}$$`}
                            className="text-slate-800 dark:text-slate-100 font-bold text-lg md:text-2xl text-center block"
                        />
                    </div>

                    {/* تبرير / ملاحظة */}
                    {currentStep.explanation && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-3 p-3 rounded-xl bg-sky-50/80 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/30"
                        >
                            <MathText
                                text={currentStep.explanation}
                                className="text-sky-700 dark:text-sky-300 text-sm md:text-base font-medium block"
                            />
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* شارة العملية (بين الخطوات) */}
            {hasNext && currentStep.operation && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center"
                >
                    <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/25 flex items-center gap-2">
                        <span className="text-violet-200">⟵</span>
                        <span>{currentStep.operation}</span>
                    </div>
                </motion.div>
            )}

            {/* أزرار التحكم */}
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={!hasPrev}
                    className={clsx(
                        'px-4 py-2 rounded-xl font-bold text-sm transition-all',
                        hasPrev
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                            : 'bg-slate-50  dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    )}
                >
                    ← السابق
                </button>

                {/* مؤشر الموضع */}
                <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={clsx(
                                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                                i === currentIndex
                                    ? 'bg-sky-500 scale-125 animate-dot-pulse'
                                    : i < currentIndex
                                        ? 'bg-emerald-400'
                                        : 'bg-slate-200 dark:bg-slate-600'
                            )}
                        />
                    ))}
                </div>

                <button
                    onClick={() => {
                        if (hasNext) {
                            setCurrentIndex(prev => prev + 1);
                            if (currentIndex + 1 >= steps.length - 1) {
                                onComplete?.();
                            }
                        }
                    }}
                    disabled={!hasNext}
                    className={clsx(
                        'px-4 py-2 rounded-xl font-bold text-sm transition-all',
                        hasNext
                            ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/20'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    )}
                >
                    التالي →
                </button>
            </div>

            {/* زر التشغيل التلقائي */}
            {steps.length > 2 && (
                <div className="flex justify-center">
                    <button
                        onClick={() => {
                            setIsPlaying(!isPlaying);
                            if (currentIndex >= steps.length - 1) {
                                setCurrentIndex(0);
                                setIsPlaying(true);
                            }
                        }}
                        className="px-5 py-2 rounded-xl bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold text-sm hover:bg-violet-200 dark:hover:bg-violet-500/25 transition-all flex items-center gap-2"
                    >
                        {isPlaying ? (
                            <>⏸ إيقاف</>
                        ) : (
                            <>▶ تشغيل تلقائي</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
