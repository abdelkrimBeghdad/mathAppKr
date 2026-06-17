import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Lock, Unlock, ChevronDown } from 'lucide-react';
import MathText from '../MathText';
import clsx from 'clsx';

const HINT_LEVELS = [
    {
        id: 'nudge',
        label: 'دفعة 🤔',
        description: 'اتجاه عام',
        cost: 5,
        opacity: 0.6,
        bgClass: 'bg-amber-50 dark:bg-amber-500/5',
        borderClass: 'border-amber-200/60 dark:border-amber-500/20',
        textClass: 'text-amber-700/80 dark:text-amber-300/80',
    },
    {
        id: 'guide',
        label: 'إرشاد 💡',
        description: 'طريقة محددة',
        cost: 15,
        opacity: 0.8,
        bgClass: 'bg-sky-50 dark:bg-sky-500/5',
        borderClass: 'border-sky-200/60 dark:border-sky-500/20',
        textClass: 'text-sky-700/90 dark:text-sky-300/90',
    },
    {
        id: 'solution',
        label: 'حل كامل 🌟',
        description: 'شرح كامل',
        cost: 30,
        opacity: 1,
        bgClass: 'bg-emerald-50 dark:bg-emerald-500/5',
        borderClass: 'border-emerald-200/60 dark:border-emerald-500/20',
        textClass: 'text-emerald-700 dark:text-emerald-300',
    },
];

/**
 * نظام تلميحات تدريجي — 3 مستويات مع تكاليف XP
 */
export default function ProgressiveHints({
    hints = [],
    currentXP = 0,
    onRequestHint,
    maxRevealed = 0,
}) {
    const [revealedCount, setRevealedCount] = useState(maxRevealed);
    const [isExpanded, setIsExpanded] = useState(true);

    if (!hints || hints.length === 0) return null;

    const revealHint = (levelIndex) => {
        const level = HINT_LEVELS[levelIndex];
        if (!level) return;

        if (currentXP < level.cost) {
            return; // ليس لديك XP كافية
        }

        setRevealedCount(prev => Math.max(prev, levelIndex + 1));
        onRequestHint?.(levelIndex, level.cost);
    };

    return (
        <div className="mt-4 rounded-2xl border-2 border-slate-200/60 dark:border-slate-600/40 overflow-hidden">
            {/* الرأس */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between gap-3 p-4 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <Lightbulb size={20} className="text-amber-500" />
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                        تلميحات ({revealedCount}/{hints.length})
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    className={clsx(
                        'text-slate-400 transition-transform',
                        isExpanded && 'rotate-180'
                    )}
                />
            </button>

            {/* محتوى التلميحات */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 space-y-3">
                            {/* شريط تقدم التلميحات */}
                            <div className="flex gap-2 mb-3">
                                {hints.map((_, i) => (
                                    <div
                                        key={i}
                                        className={clsx(
                                            'flex-1 h-1.5 rounded-full transition-all duration-500',
                                            i < revealedCount
                                                ? 'bg-amber-400 dark:bg-amber-500'
                                                : 'bg-slate-200 dark:bg-slate-600'
                                        )}
                                    />
                                ))}
                            </div>

                            {/* بطاقات التلميح */}
                            {hints.map((hint, index) => {
                                const level = HINT_LEVELS[index] || HINT_LEVELS[HINT_LEVELS.length - 1];
                                const isRevealed = index < revealedCount;
                                const isNext = index === revealedCount;
                                const canAfford = currentXP >= level.cost;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={isRevealed ? { opacity: 0, y: 10 } : false}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        {isRevealed ? (
                                            // تلميح مكشوف
                                            <div
                                                className={clsx(
                                                    'p-4 rounded-xl border-2 transition-all',
                                                    level.bgClass,
                                                    level.borderClass
                                                )}
                                                style={{ opacity: level.opacity }}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Unlock size={14} className="text-emerald-500" />
                                                    <span className={clsx('text-xs font-bold', level.textClass)}>
                                                        {level.label}
                                                    </span>
                                                </div>
                                                <MathText
                                                    text={hint}
                                                    className={clsx('font-medium text-sm leading-relaxed block', level.textClass)}
                                                />
                                            </div>
                                        ) : isNext ? (
                                            // تلميح تالي (قابل للفتح)
                                            <button
                                                onClick={() => revealHint(index)}
                                                disabled={!canAfford}
                                                className={clsx(
                                                    'w-full p-4 rounded-xl border-2 border-dashed transition-all text-right',
                                                    canAfford
                                                        ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/50 dark:bg-amber-500/5 hover:bg-amber-50 dark:hover:bg-amber-500/10 cursor-pointer group'
                                                        : 'border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 cursor-not-allowed opacity-60'
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Lock size={16} className={canAfford ? 'text-amber-500 group-hover:hidden' : 'text-slate-400'} />
                                                        <Unlock size={16} className="text-amber-500 hidden group-hover:block" />
                                                        <span className="font-bold text-sm text-slate-600 dark:text-slate-300">
                                                            {level.label}
                                                        </span>
                                                        <span className="text-xs text-slate-400">— {level.description}</span>
                                                    </div>
                                                    <span className={clsx(
                                                        'text-xs font-bold px-2.5 py-1 rounded-full',
                                                        canAfford
                                                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400'
                                                    )}>
                                                        -{level.cost} XP
                                                    </span>
                                                </div>
                                            </button>
                                        ) : (
                                            // تلميح مقفل
                                            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 opacity-40">
                                                <div className="flex items-center gap-2">
                                                    <Lock size={14} className="text-slate-400" />
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {level.label} — افتح التلميح السابق أولاً
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
