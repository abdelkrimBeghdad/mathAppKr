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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, RefreshCw, Trophy, Coins, Zap, Award } from 'lucide-react';
import { useLabTheme } from './LabThemeContext';

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
    question,           // نص السؤال (اختياري)
    hint,               // نص التلميح
    feedback,           // { type: 'success'|'error', text: '...' }
    reward,             // بيانات المكافأة عند الإكمال
    onRefresh,          // استدعاء عند الضغط على "سؤال جديد"
    onRestart,          // استدعاء عند الضغط على "تحدي جديد" في شاشة المكافأة
    sidePanel,          // عنصر اختياري — <LabStepsPanel> لمختبرات الخوارزميات متعددة الخطوات فقط
    children,           // المحتوى التفاعلي (input / visual / choices)
}) {
    const { theme, isDarkMode, currentAccent } = useLabTheme();
    const [showHint, setShowHint] = useState(false);

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
        <div className={`flex flex-col items-center w-full px-2 gap-4 ${sidePanel ? 'max-w-4xl' : 'max-w-2xl'}`}>

            {/* ── شريط التقدم + المؤشرات ─────────────────────────────────────── */}
            <div className="w-full">
                {/* النص العلوي */}
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black ${theme.textSub}`}>
                        سؤال {current} من {total}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[level]}`}>
                        {LEVEL_LABELS[level]}
                    </span>
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
            <div className={`w-full flex flex-col md:flex-row gap-4 items-start ${sidePanel ? '' : ''}`}>
                <div className={`w-full p-5 rounded-[1.25rem] border shadow-xl backdrop-blur-3xl ${theme.card}`}>

                    {/* نص السؤال — يظهر فقط إذا مرّرناه */}
                    {question && (
                        <p className={`text-sm md:text-base font-black text-center mb-5 leading-relaxed ${theme.textMain}`}>
                            {question}
                        </p>
                    )}

                    {/* المحتوى التفاعلي — يأتي من المختبر */}
                    <div className={`w-full flex flex-col items-center gap-4 ${type === 'visual' ? 'min-h-[160px] justify-center' : ''}`}>
                        {children}
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
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        role="alert"
                        aria-live="polite"
                        className={`w-full py-3 px-4 rounded-xl border font-bold text-sm text-center ${feedback.type === 'success'
                                ? isDarkMode
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : isDarkMode
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                    : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}
                    >
                        {feedback.type === 'success' ? '✓ ' : '✗ '}{feedback.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── شريط الأدوات السفلي ─────────────────────────────────────────── */}
            <div className="w-full flex items-center justify-between">

                {/* زر التلميح */}
                {hint ? (
                    <div className="flex flex-col items-start gap-1">
                        <button
                            onClick={() => setShowHint(s => !s)}
                            className={`flex items-center gap-1.5 text-xs font-black transition-all ${showHint
                                    ? 'text-amber-400'
                                    : isDarkMode ? 'text-slate-500 hover:text-amber-400' : 'text-slate-400 hover:text-amber-600'
                                }`}
                            aria-expanded={showHint}
                            aria-label="تلميح"
                        >
                            <HelpCircle size={15} />
                            تلميح
                        </button>
                        <AnimatePresence>
                            {showHint && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`text-xs font-medium max-w-[200px] leading-relaxed ${isDarkMode ? 'text-amber-300/80' : 'text-amber-700'}`}
                                >
                                    {hint}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                ) : <div />}

                {/* زر سؤال جديد */}
                {onRefresh && (
                    <button
                        onClick={() => { setShowHint(false); onRefresh(); }}
                        className={`flex items-center gap-1.5 text-xs font-black transition-all ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                        aria-label="سؤال جديد"
                    >
                        <RefreshCw size={14} />
                        سؤال جديد
                    </button>
                )}
            </div>
        </div>
    );
}
