/**
 * LabChallenge.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * قالب UI/UX موحّد لجميع مختبرات mastryworld.
 *
 * يوفر:
 *  - Progress bar موحّد
 *  - مؤشر السؤال الحالي + المستوى
 *  - 3 أنواع محتوى: text | visual | choice
 *  - Feedback موحّد (نجاح / خطأ)
 *  - زر تلميح موحّد
 *  - زر "سؤال جديد" موحّد
 *  - شاشة المكافأة النهائية
 *
 * الاستخدام:
 *  <LabChallenge
 *    type="text"              // "text" | "visual" | "choice"
 *    labId="equations"
 *    current={1}             // رقم السؤال الحالي
 *    total={3}               // إجمالي الأسئلة
 *    level={2}               // 1|2|3
 *    question="حل: x+5=12"   // نص السؤال (اختياري لـ visual)
 *    hint="انقل +5..."
 *    reward={rewardData}     // بيانات المكافأة عند الإكمال
 *    onRefresh={fn}          // زر "سؤال جديد"
 *    onRestart={fn}          // زر إعادة التشغيل في شاشة المكافأة
 *  >
 *    // محتوى المختبر (input / visual / choices)
 *  </LabChallenge>
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, RefreshCw, Trophy, Coins, Zap, Award, GraduationCap, X, Compass } from 'lucide-react';
import { useLabTheme } from './LabThemeContext';
import TutorialTour from './TutorialTour';

// ─── مؤشر المستوى ─────────────────────────────────────────────────────────────
const LEVEL_LABELS = { 1: 'مبتدئ', 2: 'متوسط', 3: 'متقدم' };
const LEVEL_COLORS = {
    1: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    3: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

// ─── شاشة المكافأة ────────────────────────────────────────────────────────────
function RewardScreen({ reward, onRestart, theme, isDarkMode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center px-2"
        >
            {/* بطاقة الإنجاز */}
            <div className={`p-6 rounded-[1.5rem] border-2 mb-4 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                <Trophy size={40} className="mx-auto text-emerald-400 mb-3" />
                <h3 className={`text-xl font-black mb-1 ${theme.textMain}`}>أحسنت!</h3>
                <p className={`text-sm ${theme.textSub}`}>أكملت المختبر بنجاح</p>
            </div>

            {/* المكافآت */}
            {reward && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-3 justify-center mb-4"
                >
                    {reward?.reward?.coins !== undefined && (
                        <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full border border-amber-500/30 font-bold text-sm">
                            <Coins size={16} /> +{reward.reward.coins}
                        </div>
                    )}
                    {reward?.reward?.xp !== undefined && (
                        <div className="flex items-center gap-2 bg-sky-500/20 text-sky-400 px-4 py-2 rounded-full border border-sky-500/30 font-bold text-sm">
                            <Zap size={16} /> +{reward.reward.xp} XP
                        </div>
                    )}
                </motion.div>
            )}

            {/* وسام */}
            {reward?.badge && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-4 bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-400 p-5 rounded-[1rem] text-center"
                >
                    <Award className="text-indigo-400 w-12 h-12 mx-auto mb-2" />
                    <h3 className="text-lg font-black text-white mb-1">وسام جديد!</h3>
                    <div className="text-xl font-black text-indigo-300">{reward.badge.name}</div>
                    <p className="text-slate-400 mt-1 text-xs">{reward.badge.description}</p>
                </motion.div>
            )}

            {/* زر إعادة التشغيل */}
            <button
                onClick={onRestart}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2"
            >
                <RefreshCw size={18} /> تحدي جديد
            </button>
        </motion.div>
    );
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function LabChallenge({
    type = 'text',      // 'text' | 'visual' | 'choice'
    current = 1,        // رقم السؤال الحالي (يبدأ من 1)
    total = 3,          // إجمالي الأسئلة
    level = 1,          // مستوى الطالب
    levelLabel,         // اختياري لتخصيص نص المستوى
    counterPrefix = 'المسألة', // 'المسألة' | 'سؤال' | 'التحدي'
    question,           // نص السؤال (اختياري)
    hint,               // نص التلميح (جملة واحدة مختصرة)
    tutorial,           // مصفوفة خطوات شرح الحل الكامل: [{ title, detail }] — خاصة بالسؤال الحالي
    feedback,           // { type: 'success'|'error', text: '...' }
    reward,             // بيانات المكافأة عند الإكمال
    onRefresh,          // استدعاء عند الضغط على "سؤال جديد"
    onRestart,          // استدعاء عند الضغط على "تحدي جديد" في شاشة المكافأة
    sidePanel,          // عنصر اختياري — <LabStepsPanel> لمختبرات الخوارزميات متعددة الخطوات فقط
    tourSteps,          // اختياري — [{ target, title, description }] يفعّل زر "جولة تعريفية" (Coach Marks)
    children,           // المحتوى التفاعلي (input / visual / choices)
}) {
    const { theme, isDarkMode, currentAccent } = useLabTheme();
    const [showHint, setShowHint] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showTour, setShowTour] = useState(false);

    // Anti-Brute Force mechanism
    const [consecutiveErrors, setConsecutiveErrors] = useState(0);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    useEffect(() => {
        if (feedback?.type === 'error') {
            setConsecutiveErrors(prev => {
                const next = prev + 1;
                if (next >= 3) {
                    setCooldownRemaining(5); // 5 seconds cooldown
                    return 0; // reset for next time
                }
                return next;
            });
        } else if (feedback?.type === 'success') {
            setConsecutiveErrors(0);
        }
    }, [feedback]);

    useEffect(() => {
        if (cooldownRemaining > 0) {
            const timer = setTimeout(() => setCooldownRemaining(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownRemaining]);

    const progress = (current - 1) / total; // 0 → 1

    // ── شاشة المكافأة ─────────────────────────────────────────────────────────
    if (reward) return (
        <RewardScreen
            reward={reward}
            onRestart={onRestart}
            theme={theme}
            isDarkMode={isDarkMode}
        />
    );

    return (
        <div className={`flex flex-col items-center w-full px-1 sm:px-2 gap-2.5 sm:gap-3.5 ${sidePanel ? 'max-w-4xl' : 'max-w-2xl'} my-auto`}>

            {/* ── شريط التقدم + المؤشرات ─────────────────────────────────────── */}
            <div className="w-full shrink-0">
                {/* النص العلوي */}
                <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] sm:text-xs font-black ${theme.textSub}`}>
                        {counterPrefix} {current} من {total}
                    </span>
                    <div className="flex items-center gap-2">
                        {tourSteps && tourSteps.length > 0 && (
                            <button
                                data-tour-id="lab-tour-trigger"
                                onClick={() => setShowTour(true)}
                                className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border transition-all cursor-pointer ${isDarkMode ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
                                aria-label="ابدأ جولة تعريفية على الشاشة"
                            >
                                <Compass size={11} /> جولة تعريفية
                            </button>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[level] || LEVEL_COLORS[1]}`}>
                            {levelLabel || LEVEL_LABELS[level] || LEVEL_LABELS[1]}
                        </span>
                    </div>
                </div>

                {/* الشريط */}
                <div
                    className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}
                    role="progressbar"
                    aria-valuenow={current}
                    aria-valuemin={1}
                    aria-valuemax={total}
                    aria-label={`التقدم في المختبر: سؤال ${current} من ${total}`}
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${currentAccent.text.replace('text-', 'bg-')}`}
                        style={{ background: 'var(--accent-color, #6366f1)' }}
                    />
                </div>
            </div>

            {/* ── بطاقة المحتوى (+ لوحة الخطوات الجانبية إن وُجدت) ─────────────── */}
            <div className={`w-full flex flex-col md:flex-row gap-3 items-stretch`}>
                <div className={`w-full p-3.5 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] border shadow-xl backdrop-blur-3xl ${theme.card} flex flex-col justify-center`}>

                    {/* نص السؤال — يظهر فقط إذا مرّرناه */}
                    {question && (
                        <p data-tour-id="lab-question" className={`text-xs sm:text-sm md:text-base font-black text-center mb-3 sm:mb-4 leading-relaxed ${theme.textMain}`}>
                            {question}
                        </p>
                    )}

                    {/* المحتوى التفاعلي — يأتي من المختبر */}
                    <div data-tour-id="lab-content" className={`w-full flex flex-col items-center gap-2 sm:gap-3 ${type === 'visual' ? 'min-h-[140px] justify-center' : ''} relative`}>
                        {children}

                        {/* Cooldown Overlay */}
                        <AnimatePresence>
                            {cooldownRemaining > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-md rounded-xl text-white shadow-2xl border border-white/10"
                                >
                                    <span className="text-3xl mb-2 animate-pulse">⏳</span>
                                    <h3 className="text-base font-black mb-1">توقف للتفكير...</h3>
                                    <p className="text-xs font-bold text-slate-300">يمكنك المحاولة مجدداً بعد <span className="text-rose-400 text-base mx-1">{cooldownRemaining}</span> ثوانٍ</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* لوحة الخطوات الجانبية — اختيارية، لمختبرات الخوارزميات فقط */}
                {sidePanel}
            </div>

            {/* ── Feedback ────────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {feedback && (
                    <motion.div
                        key={feedback.type + feedback.text}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        role="alert"
                        aria-live="polite"
                        dir="rtl"
                        className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 shrink-0 ${feedback.type === 'success'
                                ? isDarkMode
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : isDarkMode
                                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                                    : 'bg-rose-50 border-rose-300 text-rose-800'
                            }`}
                    >
                        <span className="text-base font-black shrink-0">{feedback.type === 'success' ? '✓' : '✗'}</span>
                        <span className="leading-snug">{feedback.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── شريط الأدوات السفلي ─────────────────────────────────────────── */}
            <div className="w-full flex items-center justify-between gap-3 shrink-0">

                {/* زر التلميح */}
                {hint ? (
                    <div className="flex flex-col items-start gap-1">
                        <button
                            data-tour-id="lab-hint-button"
                            onClick={() => setShowHint(s => !s)}
                            className={`flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${showHint
                                    ? 'text-amber-400'
                                    : isDarkMode ? 'text-slate-500 hover:text-amber-400' : 'text-slate-400 hover:text-amber-600'
                                }`}
                            aria-expanded={showHint}
                            aria-label="تلميح"
                        >
                            <HelpCircle size={14} />
                            <span>تلميح</span>
                        </button>
                        <AnimatePresence>
                            {showHint && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`text-[11px] font-medium max-w-[240px] leading-relaxed ${isDarkMode ? 'text-amber-300/80' : 'text-amber-700'}`}
                                >
                                    {hint}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                ) : <div />}

                <div className="flex items-center gap-3">
                    {/* زر شرح الحل الكامل */}
                    {tutorial && tutorial.length > 0 && (
                        <button
                            onClick={() => setShowTutorial(true)}
                            className={`flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                            aria-label="اشرح لي طريقة الحل بالتفصيل"
                        >
                            <GraduationCap size={15} />
                            <span>كيف أحل هذا؟</span>
                        </button>
                    )}

                    {/* زر سؤال جديد */}
                    {onRefresh && (
                        <button
                            onClick={() => { setShowHint(false); onRefresh(); }}
                            className={`flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                            aria-label="سؤال جديد"
                        >
                            <RefreshCw size={13} />
                            <span>سؤال جديد</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ── نافذة شرح الحل الكامل (Tutorial Modal) ──────────────────────── */}
            <AnimatePresence>
                {showTutorial && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowTutorial(false)}
                        role="dialog" aria-modal="true" aria-label="شرح طريقة الحل"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={e => e.stopPropagation()}
                            className={`w-full max-w-md max-h-[80vh] overflow-y-auto rounded-[1.25rem] border shadow-2xl p-5 ${theme.card}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <GraduationCap size={20} className="text-indigo-400" />
                                    <h3 className={`text-sm font-black ${theme.textMain}`}>طريقة الحل خطوة بخطوة</h3>
                                </div>
                                <button
                                    onClick={() => setShowTutorial(false)}
                                    aria-label="إغلاق شرح الحل"
                                    className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                {tutorial && tutorial.map((step, i) => (
                                    <div
                                        key={i}
                                        className={`p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {i + 1}
                                            </span>
                                            <div>
                                                <p className={`text-xs font-bold mb-1 ${theme.textMain}`}>{step.title}</p>
                                                <p className={`text-xs leading-relaxed ${theme.textSub}`} dir={step.dir || 'rtl'}>{step.detail}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowTutorial(false)}
                                className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm transition-all"
                            >
                                فهمت، أكمل بنفسي
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {tourSteps && tourSteps.length > 0 && (
                <TutorialTour
                    isOpen={showTour}
                    onClose={() => setShowTour(false)}
                    steps={tourSteps}
                />
            )}
        </div>
    );
}