import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import MathText from '../MathText';
import clsx from 'clsx';

const TYPE_CONFIG = {
    rule: {
        icon: '💡',
        title: 'قاعدة',
        bgClass: 'bg-amber-50 dark:bg-amber-500/10',
        borderClass: 'border-amber-200 dark:border-amber-500/30',
        glowClass: 'animate-border-glow-amber',
        textClass: 'text-amber-700 dark:text-amber-300',
        iconBg: 'bg-amber-100 dark:bg-amber-500/20',
    },
    caution: {
        icon: '⚠️',
        title: 'انتبه',
        bgClass: 'bg-rose-50 dark:bg-rose-500/10',
        borderClass: 'border-rose-200 dark:border-rose-500/30',
        glowClass: 'animate-border-glow-rose',
        textClass: 'text-rose-700 dark:text-rose-300',
        iconBg: 'bg-rose-100 dark:bg-rose-500/20',
    },
    property: {
        icon: '📐',
        title: 'خاصية',
        bgClass: 'bg-sky-50 dark:bg-sky-500/10',
        borderClass: 'border-sky-200 dark:border-sky-500/30',
        glowClass: 'animate-border-glow',
        textClass: 'text-sky-700 dark:text-sky-300',
        iconBg: 'bg-sky-100 dark:bg-sky-500/20',
    },
    tip: {
        icon: '✨',
        title: 'نصيحة',
        bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
        borderClass: 'border-emerald-200 dark:border-emerald-500/30',
        glowClass: 'animate-border-glow-emerald',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    },
};

/**
 * بطاقات التبرير — تبرز القواعد والخصائص والنصائح والتحذيرات
 */
export default function ReasoningHighlight({
    type = 'rule',
    text,
    learnMore,
    animate = true,
}) {
    const [showMore, setShowMore] = useState(false);
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.rule;

    return (
        <motion.div
            initial={animate ? { opacity: 0, scale: 0.95, y: 10 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={clsx(
                'relative rounded-2xl border-2 p-4 md:p-5 backdrop-blur-sm overflow-hidden',
                config.bgClass,
                config.borderClass,
                config.glowClass
            )}
        >
            {/* خلفية زجاجية */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 pointer-events-none" />

            <div className="relative z-10">
                {/* الرأس */}
                <div className="flex items-center gap-3 mb-3">
                    <div className={clsx(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0',
                        config.iconBg
                    )}>
                        {config.icon}
                    </div>
                    <span className={clsx('font-black text-base', config.textClass)}>
                        {config.title}
                    </span>
                </div>

                {/* النص الرئيسي */}
                <MathText
                    text={text}
                    className={clsx('font-bold text-sm md:text-base leading-relaxed block', config.textClass)}
                />

                {/* اعرف أكثر */}
                {learnMore && (
                    <div className="mt-3">
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className={clsx(
                                'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all',
                                'bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80',
                                config.textClass
                            )}
                        >
                            <span>{showMore ? 'إخفاء' : 'اعرف أكثر'}</span>
                            {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <AnimatePresence>
                            {showMore && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 pt-3 border-t border-current/10">
                                        <MathText
                                            text={learnMore}
                                            className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed block"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
