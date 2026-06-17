import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { StreakBadge } from './GamifiedFeedback';
import clsx from 'clsx';

/**
 * شريط تقدم الدرس — ثابت أعلى الصفحة
 * يعرض خطوات الدرس مع علامات التقدم وعدّاد XP
 */
export default function LessonProgressBar({
    currentStep,
    totalSteps,
    completedSteps = [],
    xpEarned = 0,
    streak = 0,
    className,
}) {
    const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

    return (
        <div className={clsx(
            'sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-700/60 py-3 px-4 md:px-6',
            className
        )}>
            <div className="max-w-4xl mx-auto">
                {/* الصف العلوي: XP + السلسلة + الخطوة */}
                <div className="flex items-center justify-between mb-2.5">
                    {/* XP */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-500/15">
                            <Zap size={14} className="text-amber-500 fill-amber-500" />
                            <span className="text-sm font-black text-amber-600 dark:text-amber-400">{xpEarned} XP</span>
                        </div>
                        <StreakBadge streak={streak} />
                    </div>

                    {/* رقم الخطوة */}
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                        الخطوة {currentStep + 1} من {totalSteps}
                    </span>
                </div>

                {/* شريط التقدم */}
                <div className="lesson-progress-track">
                    <motion.div
                        className="lesson-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    />
                </div>

                {/* علامات الخطوات (مخفية على الهاتف) */}
                <div className="hidden md:flex items-center justify-between mt-2 px-1">
                    {Array.from({ length: totalSteps }).map((_, i) => {
                        const isCompleted = completedSteps.includes(i);
                        const isCurrent = i === currentStep;
                        const isPast = i < currentStep;

                        return (
                            <div key={i} className="flex flex-col items-center">
                                <motion.div
                                    animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className={clsx(
                                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all',
                                        isCompleted || isPast
                                            ? 'bg-emerald-500 text-white shadow-sm'
                                            : isCurrent
                                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 animate-pulse-highlight'
                                                : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500'
                                    )}
                                >
                                    {isCompleted || isPast ? <Check size={12} className="stroke-[3]" /> : i + 1}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
