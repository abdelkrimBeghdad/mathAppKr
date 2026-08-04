/**
 * TutorialTour.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * جولة تعريفية تفاعلية على طراز "Coach Marks" (نفس أسلوب أول مرة تفتح فيها
 * تطبيقات مثل Notion/Figma): عند تفعيلها، تُعتّم الشاشة وتُضاء نقطة واحدة فقط
 * (العنصر المستهدف)، مع صندوق صغير بجانبها يشرح "ماهية" هذا العنصر، ثم تنتقل
 * تلقائياً للعنصر التالي بالنقر على "التالي".
 *
 * الفرق عن LabTutorialNote القديم: بدل نص ثابت منفصل عن الشاشة، الشرح الآن
 * مرتبط بصرياً ومباشرة بمكانه الفعلي على الشاشة (سهم + توهّج)، وتقدَّم المعلومة
 * على دفعات صغيرة (خطوة بخطوة) بدل دفعة واحدة.
 *
 * كيف تُحدَّد "الأهداف": كل عنصر تريد تسليط الضوء عليه يجب أن يحمل خاصية
 * data-tour-id="xxx" مطابقة لحقل target في مصفوفة الخطوات.
 *
 * الاستخدام:
 *   <button data-tour-id="answer-input" ...>
 *
 *   <TutorialTour
 *     isOpen={showTour}
 *     onClose={() => setShowTour(false)}
 *     steps={[
 *       { target: 'answer-input', title: 'حقل الإجابة', description: 'هنا تكتب...' },
 *       { target: 'hint-button', title: 'زر التلميح', description: 'إن احتجت مساعدة...' },
 *     ]}
 *   />
 */
import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useLabTheme } from './LabThemeContext';

const PADDING = 10; // مساحة التوهّج الإضافية حول العنصر الفعلي
const GAP = 14;      // المسافة بين التوهّج وصندوق الشرح

function getTargetRect(targetId) {
    const el = document.querySelector(`[data-tour-id="${targetId}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
    };
}

/** يحسب أفضل مكان لصندوق الشرح (أسفل/أعلى العنصر) حسب المساحة المتوفرة في الشاشة. */
function computeTooltipPosition(rect) {
    if (!rect) return null;
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const spaceBelow = viewportH - (rect.top + rect.height);
    const placeBelow = spaceBelow > 180 || spaceBelow > rect.top;

    const boxWidth = 300;
    let left = rect.left + rect.width / 2 - boxWidth / 2;
    left = Math.max(12, Math.min(left, viewportW - boxWidth - 12));

    return {
        top: placeBelow ? rect.top + rect.height + GAP : undefined,
        bottom: placeBelow ? undefined : viewportH - rect.top + GAP,
        left,
        placeBelow,
        width: boxWidth,
    };
}

export default function TutorialTour({ isOpen, onClose, steps = [], onComplete }) {
    const { theme, isDarkMode } = useLabTheme();
    const [stepIndex, setStepIndex] = useState(0);
    const [rect, setRect] = useState(null);

    const step = steps[stepIndex];
    const tooltipPos = computeTooltipPosition(rect);

    const recalc = useCallback(() => {
        if (!step) return;
        setRect(getTargetRect(step.target));
    }, [step]);

    useLayoutEffect(() => {
        if (!isOpen) return;
        recalc();
        // العنصر المستهدف قد يكون خارج مجال الرؤية (مثلاً أسفل الصفحة) — نمرّر إليه بلطف
        const el = document.querySelector(`[data-tour-id="${step?.target}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const t = setTimeout(() => {
            recalc();
            // إن كان العنصر المستهدف غير موجود حالياً في الصفحة (مثلاً خطوة تفاعلية
            // سابقة تغيّرت واختفت)، نتخطى هذه الخطوة تلقائياً بدل ترك المستخدم
            // أمام شاشة معتّمة بلا صندوق شرح ولا زر "التالي" ليتابع منه.
            if (!getTargetRect(step?.target)) {
                if (stepIndex < steps.length - 1) {
                    setStepIndex(i => i + 1);
                } else {
                    onClose?.();
                }
            }
        }, 350); // بعد انتهاء التمرير السلس
        return () => clearTimeout(t);
    }, [isOpen, stepIndex, recalc, step]);

    useEffect(() => {
        if (!isOpen) return;
        window.addEventListener('resize', recalc);
        window.addEventListener('scroll', recalc, true);
        return () => {
            window.removeEventListener('resize', recalc);
            window.removeEventListener('scroll', recalc, true);
        };
    }, [isOpen, recalc]);

    useEffect(() => {
        if (isOpen) setStepIndex(0);
    }, [isOpen]);

    if (!isOpen || steps.length === 0) return null;

    const isLast = stepIndex === steps.length - 1;

    const goNext = () => {
        if (isLast) {
            onComplete?.();
            onClose?.();
        } else {
            setStepIndex(i => i + 1);
        }
    };
    const goPrev = () => setStepIndex(i => Math.max(0, i - 1));

    return (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="جولة تعريفية">
            {/* التعتيم + التوهّج: box-shadow بمساحة ضخمة حول مستطيل صغير يخلق "ثقب" مضيء */}
            <AnimatePresence mode="wait">
                {rect && (
                    <motion.div
                        key={step.target}
                        initial={false}
                        animate={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed rounded-2xl pointer-events-none"
                        style={{ boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.75)', border: '2px solid rgba(99,102,241,0.8)' }}
                    />
                )}
            </AnimatePresence>

            {/* طبقة شفافة تغلق الجولة بالنقر خارج الصندوق (لا تمنع أزرار المختبر تحتها لأن position خارج الثقب فعلياً محجوبة أصلاً بصرياً فقط) */}
            <button
                onClick={onClose}
                aria-label="إغلاق الجولة التعريفية"
                className="fixed inset-0 w-full h-full cursor-default"
                style={{ background: 'transparent' }}
            />

            {/* صندوق الشرح */}
            <AnimatePresence mode="wait">
                {tooltipPos && (
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, y: tooltipPos.placeBelow ? -10 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: tooltipPos.placeBelow ? -10 : 10 }}
                        transition={{ duration: 0.2 }}
                        dir="rtl"
                        className={`fixed rounded-2xl border-2 p-4 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-300'}`}
                        style={{ top: tooltipPos.top, bottom: tooltipPos.bottom, left: tooltipPos.left, width: tooltipPos.width }}
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 text-indigo-400 font-black text-xs uppercase tracking-wide">
                                <Sparkles size={14} />
                                خطوة {stepIndex + 1} من {steps.length}
                            </div>
                            <button onClick={onClose} aria-label="إغلاق" className={`shrink-0 ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
                                <X size={16} />
                            </button>
                        </div>

                        <h4 className={`font-black text-sm mb-1 ${theme.textMain}`}>{step.title}</h4>
                        <p className={`text-xs leading-relaxed font-medium ${theme.textSub}`}>{step.description}</p>

                        {/* نقاط التقدّم */}
                        <div className="flex items-center gap-1.5 my-3">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-indigo-500' : 'w-1.5 bg-white/20'}`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <button
                                onClick={onClose}
                                className={`text-[11px] font-bold ${isDarkMode ? 'text-white/40 hover:text-white/70' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                تخطي الجولة
                            </button>
                            <div className="flex items-center gap-2">
                                {stepIndex > 0 && (
                                    <button
                                        onClick={goPrev}
                                        aria-label="الخطوة السابقة"
                                        className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                                    >
                                        <ArrowRight size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={goNext}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5"
                                >
                                    {isLast ? 'إنهاء الجولة' : 'التالي'}
                                    {!isLast && <ArrowLeft size={14} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
