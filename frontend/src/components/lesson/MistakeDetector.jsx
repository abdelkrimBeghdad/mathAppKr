import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Lightbulb } from 'lucide-react';
import MathText from '../MathText';
import clsx from 'clsx';

/**
 * أنماط الأخطاء الشائعة مع رسائل عربية مستهدفة
 */
const MISTAKE_PATTERNS = {
    sign_error: {
        icon: '±',
        label: 'خطأ في الإشارة',
        message: 'يبدو أنك نسيت تغيير الإشارة عند نقل الحد إلى الطرف الآخر',
        tip: 'تذكر: عند نقل حد من طرف لآخر، نغيّر إشارته (+ تصبح - والعكس)',
    },
    operation_order: {
        icon: '🔢',
        label: 'ترتيب العمليات',
        message: 'راجع ترتيب العمليات الحسابية (الأقواس أولاً، ثم × و ÷، ثم + و -)',
        tip: 'قاعدة الأولويات: أقواس ← أسس ← ضرب/قسمة ← جمع/طرح',
    },
    fraction_error: {
        icon: '⅓',
        label: 'خطأ في الكسور',
        message: 'تحقق من عمليات الكسور — هل وحّدت المقامات بشكل صحيح؟',
        tip: 'لجمع/طرح الكسور: وحّد المقامات أولاً، ثم اجمع/اطرح البسوط',
    },
    distribution: {
        icon: '📐',
        label: 'خطأ في التوزيع',
        message: 'تأكد من توزيع المعامل على جميع الحدود داخل القوس',
        tip: 'عند ضرب عدد في قوس: اضرب العدد في كل حد داخل القوس',
    },
    calculation: {
        icon: '🔢',
        label: 'خطأ حسابي',
        message: 'تحقق من الحسابات — يبدو أن هناك خطأ في العملية الحسابية',
        tip: 'أعد الحساب ببطء وتحقق من كل خطوة',
    },
    generic: {
        icon: '❓',
        label: 'إجابة غير صحيحة',
        message: 'الإجابة ليست صحيحة تماماً. راجع الخطوات السابقة',
        tip: 'حاول مرة أخرى وركّز على القاعدة المستخدمة',
    },
};

/**
 * رسائل تشجيعية تتكيف حسب عدد المحاولات
 */
const ENCOURAGEMENT = [
    'لا بأس! الخطأ جزء من التعلم 🌱',
    'أنت على الطريق الصحيح، حاول مرة أخرى! 💪',
    'استخدم التلميحات إذا احتجت مساعدة 💡',
    'لا تقلق، حتى العلماء يخطئون! 🧪',
    'كل محاولة تقربك من الحل 🎯',
];

/**
 * كاشف الأخطاء — يحلل إجابة الطالب ويقدم ملاحظات مستهدفة
 */
export default function MistakeDetector({
    userAnswer,
    correctAnswer,
    mistakeType,
    attempts = 1,
    customMessage,
    showCorrection = false,
}) {
    // تحديد نوع الخطأ
    const detectedType = mistakeType || detectMistakeType(userAnswer, correctAnswer);
    const pattern = MISTAKE_PATTERNS[detectedType] || MISTAKE_PATTERNS.generic;
    const encouragement = ENCOURAGEMENT[Math.min(attempts - 1, ENCOURAGEMENT.length - 1)];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
        >
            {/* بطاقة الخطأ */}
            <div className="rounded-xl border-2 border-amber-200/80 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/10 p-4 overflow-hidden">
                {/* الرأس */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-lg shrink-0">
                        {pattern.icon}
                    </div>
                    <div>
                        <p className="font-bold text-amber-700 dark:text-amber-300 text-sm">
                            {pattern.label}
                        </p>
                    </div>
                </div>

                {/* الرسالة */}
                <p className="text-amber-700/90 dark:text-amber-300/90 font-medium text-sm leading-relaxed mb-3">
                    {customMessage || pattern.message}
                </p>

                {/* النصيحة */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-amber-200/40 dark:border-amber-500/20">
                    <Lightbulb size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-600/90 dark:text-amber-400/90 font-medium">
                        {pattern.tip}
                    </p>
                </div>
            </div>

            {/* مقارنة الإجابة (إذا طلبت) */}
            {showCorrection && userAnswer && correctAnswer && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border border-slate-200 dark:border-slate-600 p-4 bg-white/60 dark:bg-slate-800/60"
                >
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">مقارنة الإجابات:</p>

                    <div className="space-y-2">
                        {/* إجابة الطالب */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md shrink-0">
                                إجابتك
                            </span>
                            <div className="p-2 rounded-lg bg-rose-50/50 dark:bg-rose-500/5 border border-rose-200/50 dark:border-rose-500/20 flex-1">
                                <MathText text={`$${userAnswer}$`} className="text-rose-600 dark:text-rose-400 font-bold text-sm block" />
                            </div>
                        </div>

                        {/* السهم */}
                        <div className="flex justify-center">
                            <ArrowLeft size={18} className="text-slate-300 dark:text-slate-600 rotate-90" />
                        </div>

                        {/* الإجابة الصحيحة */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md shrink-0">
                                الصحيح
                            </span>
                            <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/20 flex-1">
                                <MathText text={`$${correctAnswer}$`} className="text-emerald-600 dark:text-emerald-400 font-bold text-sm block" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* رسالة تشجيعية */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm font-medium text-slate-500 dark:text-slate-400"
            >
                {encouragement}
            </motion.p>
        </motion.div>
    );
}

/**
 * كشف تلقائي لنوع الخطأ بناءً على مقارنة الإجابة والجواب الصحيح
 */
function detectMistakeType(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return 'generic';

    const uStr = String(userAnswer).trim();
    const cStr = String(correctAnswer).trim();

    // خطأ إشارة: إذا كانت الإجابة هي سالب الصحيح
    const uNum = parseFloat(uStr.replace(/[^\d.-]/g, ''));
    const cNum = parseFloat(cStr.replace(/[^\d.-]/g, ''));

    if (!isNaN(uNum) && !isNaN(cNum)) {
        if (uNum === -cNum) return 'sign_error';
        if (Math.abs(uNum) === Math.abs(cNum) && uNum !== cNum) return 'sign_error';
    }

    // خطأ كسور: إذا كانت الإجابة تحتوي على / 
    if (uStr.includes('/') || cStr.includes('/')) return 'fraction_error';

    return 'generic';
}
