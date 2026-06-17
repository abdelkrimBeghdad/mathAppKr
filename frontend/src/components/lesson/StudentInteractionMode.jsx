import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Send, RefreshCw } from 'lucide-react';
import MathText from '../MathText';
import clsx from 'clsx';
import confetti from 'canvas-confetti';

/**
 * نقطة تفاعل الطالب وسط الدرس
 * يدعم: نص حر، اختيار متعدد، ملء الفراغ
 */
export default function StudentInteractionMode({
    type = 'text',
    question,
    correctAnswer,
    options,
    placeholder = 'اكتب إجابتك هنا...',
    onSubmit,
    onCorrect,
    onIncorrect,
    mistakeDetector,
    children,
}) {
    const [userAnswer, setUserAnswer] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [status, setStatus] = useState('waiting'); // waiting | checking | correct | incorrect
    const [attempts, setAttempts] = useState(0);
    const [showShake, setShowShake] = useState(false);
    const inputRef = useRef(null);

    // تحقق من الإجابة
    const checkAnswer = useCallback(() => {
        const answer = type === 'multiple_choice' ? selectedOption : userAnswer.trim();

        if (!answer) return;

        setStatus('checking');

        setTimeout(() => {
            const normalize = (s) => String(s).replace(/\s+/g, '').replace(/،/g, ',').toLowerCase();
            const isCorrect = normalize(answer) === normalize(correctAnswer);

            setAttempts(prev => prev + 1);

            if (isCorrect) {
                setStatus('correct');
                onSubmit?.(answer, true);
                onCorrect?.(answer);
                // ألعاب نارية!
                confetti({
                    particleCount: 60,
                    spread: 50,
                    origin: { y: 0.7 },
                    colors: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'],
                });
            } else {
                setStatus('incorrect');
                setShowShake(true);
                onSubmit?.(answer, false);
                onIncorrect?.(answer, attempts + 1);
                setTimeout(() => setShowShake(false), 600);
            }
        }, 500);
    }, [type, userAnswer, selectedOption, correctAnswer, attempts, onSubmit, onCorrect, onIncorrect]);

    // إعادة المحاولة
    const retry = useCallback(() => {
        setStatus('waiting');
        setUserAnswer('');
        setSelectedOption(null);
        inputRef.current?.focus();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                'rounded-2xl border-2 p-5 md:p-6 transition-all',
                status === 'correct' && 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40',
                status === 'incorrect' && 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/40',
                status === 'waiting' && 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/30',
                status === 'checking' && 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30',
                showShake && 'animate-shake'
            )}
        >
            {/* السؤال */}
            {question && (
                <div className="mb-4 flex items-start gap-3">
                    <span className="text-xl">✏️</span>
                    <MathText
                        text={question}
                        className="text-slate-700 dark:text-slate-200 font-bold text-base md:text-lg block"
                    />
                </div>
            )}

            {/* منطقة الإدخال */}
            <div className="space-y-3">
                {/* نص حر */}
                {type === 'text' && status !== 'correct' && (
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userAnswer}
                            onChange={e => setUserAnswer(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                            placeholder={placeholder}
                            disabled={status === 'checking'}
                            className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-xl px-5 py-3.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-400 dark:focus:border-sky-500 transition-all font-bold placeholder-slate-400 dark:placeholder-slate-500 text-base"
                            dir="auto"
                        />
                        <button
                            onClick={checkAnswer}
                            disabled={!userAnswer.trim() || status === 'checking'}
                            className={clsx(
                                'px-5 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0',
                                userAnswer.trim() && status !== 'checking'
                                    ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 active:translate-y-0'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                            )}
                        >
                            {status === 'checking' ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span className="hidden md:inline">تحقق</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* ملء الفراغ */}
                {type === 'fill_blank' && status !== 'correct' && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <MathText
                            text={question?.split('___')[0] || ''}
                            className="text-slate-700 dark:text-slate-200 font-bold text-lg"
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={userAnswer}
                            onChange={e => setUserAnswer(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                            className="w-32 bg-white dark:bg-slate-800 border-b-4 border-sky-400 rounded-lg px-3 py-2 text-center font-bold text-lg text-sky-700 dark:text-sky-300 focus:outline-none focus:border-sky-500 transition-all"
                            dir="auto"
                        />
                        <MathText
                            text={question?.split('___')[1] || ''}
                            className="text-slate-700 dark:text-slate-200 font-bold text-lg"
                        />
                        <button
                            onClick={checkAnswer}
                            disabled={!userAnswer.trim()}
                            className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-sm hover:bg-sky-600 transition-all disabled:opacity-50"
                        >
                            <Check size={18} />
                        </button>
                    </div>
                )}

                {/* اختيار متعدد */}
                {type === 'multiple_choice' && options && status !== 'correct' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((option, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setSelectedOption(option.value || option);
                                    setStatus('waiting');
                                }}
                                className={clsx(
                                    'text-right p-4 rounded-xl border-2 font-bold transition-all text-base',
                                    selectedOption === (option.value || option)
                                        ? 'border-sky-400 bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-2 ring-sky-200/50'
                                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-sky-200 hover:bg-sky-50/50 dark:hover:bg-sky-500/5'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={clsx(
                                        'w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs shrink-0',
                                        selectedOption === (option.value || option)
                                            ? 'border-sky-400 bg-sky-500 text-white'
                                            : 'border-slate-300 dark:border-slate-500'
                                    )}>
                                        {String.fromCharCode(1571 + i)}
                                    </span>
                                    <MathText text={option.label || option} className="block" />
                                </div>
                            </button>
                        ))}
                        {selectedOption && (
                            <button
                                onClick={checkAnswer}
                                className="col-span-full px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                تأكيد الإجابة
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ملاحظات النتيجة */}
            <AnimatePresence>
                {status === 'correct' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 p-4 rounded-xl bg-emerald-100/80 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <Check size={22} className="stroke-[3]" />
                        </div>
                        <div>
                            <p className="font-black text-emerald-700 dark:text-emerald-300 text-lg">🎉 أحسنت! إجابة صحيحة</p>
                            {attempts === 1 && (
                                <p className="text-emerald-600/80 dark:text-emerald-400/80 text-sm font-medium">من المحاولة الأولى! +10 XP إضافية</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {status === 'incorrect' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 space-y-3"
                    >
                        <div className="p-4 rounded-xl bg-rose-100/80 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                                <X size={22} className="stroke-[3]" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-rose-700 dark:text-rose-300">
                                    {attempts <= 1 ? 'ليس تماماً... حاول مرة أخرى!' :
                                        attempts === 2 ? 'لا بأس، يمكنك استخدام التلميحات 💡' :
                                            'لا تستسلم! راجع الخطوات السابقة 📖'}
                                </p>
                            </div>
                        </div>

                        {/* كاشف الأخطاء */}
                        {mistakeDetector}

                        {/* زر إعادة المحاولة */}
                        <button
                            onClick={retry}
                            className="px-5 py-2.5 rounded-xl bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-sm hover:bg-rose-200 dark:hover:bg-rose-500/25 transition-all flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            حاول مرة أخرى
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* المحتوى الإضافي (تلميحات) */}
            {children}
        </motion.div>
    );
}
