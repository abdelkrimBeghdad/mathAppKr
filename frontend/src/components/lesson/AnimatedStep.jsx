import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import MathText from '../MathText';
import clsx from 'clsx';
import '../lesson/lesson-animations.css';

const STEP_TYPE_CONFIG = {
    calculation: {
        color: 'sky',
        bgClass: 'bg-sky-50 dark:bg-sky-500/10',
        borderClass: 'border-sky-200 dark:border-sky-500/30',
        badgeClass: 'bg-sky-500 text-white',
        label: 'حساب',
        icon: '🔢',
    },
    reasoning: {
        color: 'violet',
        bgClass: 'bg-violet-50 dark:bg-violet-500/10',
        borderClass: 'border-violet-200 dark:border-violet-500/30',
        badgeClass: 'bg-violet-500 text-white',
        label: 'تبرير',
        icon: '💡',
    },
    result: {
        color: 'emerald',
        bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
        borderClass: 'border-emerald-200 dark:border-emerald-500/30',
        badgeClass: 'bg-emerald-500 text-white',
        label: 'نتيجة',
        icon: '✅',
    },
    interaction: {
        color: 'amber',
        bgClass: 'bg-amber-50 dark:bg-amber-500/10',
        borderClass: 'border-amber-200 dark:border-amber-500/30',
        badgeClass: 'bg-amber-500 text-white',
        label: 'تفاعل',
        icon: '✏️',
    },
};

export default function AnimatedStep({
    step,
    stepIndex,
    isActive,
    isCompleted,
    delay = 0,
    onRevealComplete,
    children,
}) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [showDetails, setShowDetails] = useState(true);

    const type = step.type || 'calculation';
    const config = STEP_TYPE_CONFIG[type] || STEP_TYPE_CONFIG.calculation;

    useEffect(() => {
        if (isActive) {
            const timer = setTimeout(() => {
                setIsRevealed(true);
                onRevealComplete?.();
            }, 600 + delay);
            return () => clearTimeout(timer);
        }
    }, [isActive, delay, onRevealComplete]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{
                duration: 0.5,
                delay: delay * 0.001,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={clsx(
                'lesson-step-card border-2 p-5 md:p-7 transition-all',
                `type-${type}`,
                config.bgClass,
                config.borderClass,
                isActive && 'animate-border-glow ring-2 ring-sky-200/50 dark:ring-sky-500/20',
                isCompleted && 'opacity-80'
            )}
        >
            {/* رأس الخطوة */}
            <div className="flex items-center gap-3 mb-4">
                {/* شارة الرقم */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: delay * 0.001 + 0.2, type: 'spring', stiffness: 300, damping: 15 }}
                    className={clsx(
                        'w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shrink-0',
                        isCompleted ? 'bg-emerald-500 text-white' : config.badgeClass
                    )}
                >
                    {isCompleted ? <Check size={20} className="stroke-[3]" /> : stepIndex + 1}
                </motion.div>

                {/* نوع الخطوة */}
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{config.icon}</span>
                    <span className={clsx('text-sm font-bold', `text-${config.color}-600 dark:text-${config.color}-400`)}>
                        {config.label}
                    </span>
                    {step.title && (
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-2">
                            — {step.title}
                        </span>
                    )}
                </div>

                {/* زر الطي */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            {/* محتوى الخطوة */}
            <motion.div
                animate={{ height: showDetails ? 'auto' : 0, opacity: showDetails ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                {/* النص الرئيسي */}
                {step.text && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isRevealed ? 1 : 0.3, y: isRevealed ? 0 : 10 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="mb-4"
                    >
                        <MathText
                            text={step.text}
                            className="text-slate-700 dark:text-slate-200 font-bold text-base md:text-lg leading-relaxed block"
                        />
                    </motion.div>
                )}

                {/* التعبير الرياضي */}
                {step.math && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: isRevealed ? 1 : 0, scale: isRevealed ? 1 : 0.95 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className={clsx(
                            'p-4 rounded-2xl border-2 my-3',
                            isActive && 'animate-math-glow',
                            'bg-white/60 dark:bg-slate-800/60 border-slate-200/50 dark:border-slate-600/50'
                        )}
                    >
                        <MathText
                            text={`$$${step.math}$$`}
                            className="text-slate-800 dark:text-slate-100 font-bold text-sm md:text-base text-center block"
                        />
                    </motion.div>
                )}

                {/* المحتوى الإضافي (تفاعل الطالب، تلميحات...) */}
                {children}
            </motion.div>
        </motion.div>
    );
}
