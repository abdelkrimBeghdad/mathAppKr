/**
 * TutorialTour.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * جولة تعريفية تفاعلية على طراز "Coach Marks" (نفس أسلوب أول مرة تفتح فيها
 * تطبيقات مثل Notion/Figma): عند تفعيلها، تُعتّم الشاشة وتُضاء نقطة واحدة فقط
 * (العنصر المستهدف)، مع فقاعة كلام بجانبها تشرح "ماهية" هذا العنصر، ثم تنتقل
 * تلقائياً للعنصر التالي بالنقر على "التالي".
 *
 * طابع بصري بأسلوب Duolingo (بطلب المستخدم بعد رفض الصندوق العام السابق):
 * فقاعة كلام حقيقية بذيل مثلثي يشير للعنصر مباشرة، لون أخضر جريء واحد،
 * وزر "ثلاثي الأبعاد" بتأثير ضغط فعلي (طبقة سفلية داكنة تنزل عند النقر) —
 * نفس توقيع Duolingo البصري المعروف.
 *
 * الهندسة (حساب الموضع) لم تتغيّر عن النسخة السابقة، فقط الشكل البصري.
 *
 * كيف تُحدَّد "الأهداف": كل عنصر تريد تسليط الضوء عليه يجب أن يحمل خاصية
 * data-tour-id="xxx" مطابقة لحقل target في مصفوفة الخطوات.
 *
 * الاستخدام (بلا أي تغيير عن السابق):
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
import { X, ArrowLeft, PartyPopper } from 'lucide-react';

const PADDING = 10; // مساحة التوهّج الإضافية حول العنصر الفعلي
const GAP = 18;      // المسافة بين التوهّج وفقاعة الكلام (أكبر قليلاً لإفساح مكان للذيل)

function getTargetRect(targetId) {
    const el = document.querySelector(`[data-tour-id="${targetId}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
        centerX: r.left + r.width / 2,
    };
}

/** يحسب أفضل مكان لفقاعة الكلام (أسفل/أعلى العنصر) + موضع ذيلها المثلثي. */
function computeTooltipPosition(rect) {
    if (!rect) return null;
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const spaceBelow = viewportH - (rect.top + rect.height);
    const placeBelow = spaceBelow > 200 || spaceBelow > rect.top;

    const boxWidth = 300;
    let left = rect.centerX - boxWidth / 2;
    left = Math.max(12, Math.min(left, viewportW - boxWidth - 12));

    // موضع الذيل أفقياً داخل الفقاعة (يشير دائماً لمركز العنصر المستهدف تحديداً)
    let tailLeft = rect.centerX - left;
    tailLeft = Math.max(24, Math.min(tailLeft, boxWidth - 24));

    return {
        top: placeBelow ? rect.top + rect.height + GAP : undefined,
        bottom: placeBelow ? undefined : viewportH - rect.top + GAP,
        left,
        placeBelow,
        width: boxWidth,
        tailLeft,
    };
}

export default function TutorialTour({ isOpen, onClose, steps = [], onComplete }) {
    const [stepIndex, setStepIndex] = useState(0);
    const [rect, setRect] = useState(null);
    const [pressed, setPressed] = useState(false);

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
            // أمام شاشة معتّمة بلا فقاعة شرح ولا زر "التالي" ليتابع منه.
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
                        style={{ boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.72)', border: '3px solid #58cc02' }}
                    />
                )}
            </AnimatePresence>

            {/* طبقة شفافة تغلق الجولة بالنقر خارج الفقاعة */}
            <button
                onClick={onClose}
                aria-label="إغلاق الجولة التعريفية"
                className="fixed inset-0 w-full h-full cursor-default"
                style={{ background: 'transparent' }}
            />

            {/* فقاعة الكلام بطراز Duolingo */}
            <AnimatePresence mode="wait">
                {tooltipPos && (
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, scale: 0.85, y: tooltipPos.placeBelow ? -12 : 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        dir="rtl"
                        className="fixed"
                        style={{ top: tooltipPos.top, bottom: tooltipPos.bottom, left: tooltipPos.left, width: tooltipPos.width }}
                    >
                        {/* الذيل المثلثي — يشير مباشرة للعنصر المستهدف */}
                        <div
                            className="absolute w-4 h-4 bg-white"
                            style={{
                                left: tooltipPos.tailLeft - 8,
                                [tooltipPos.placeBelow ? 'top' : 'bottom']: -7,
                                transform: 'rotate(45deg)',
                                borderRadius: '3px',
                                boxShadow: tooltipPos.placeBelow ? '-2px -2px 2px -1px rgba(0,0,0,0.04)' : '2px 2px 2px -1px rgba(0,0,0,0.04)',
                            }}
                        />

                        {/* جسم الفقاعة */}
                        <div className="relative bg-white rounded-[1.5rem] p-4 shadow-[0_8px_0_rgba(0,0,0,0.08),0_10px_24px_rgba(0,0,0,0.15)]">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-1.5 text-[#58cc02] font-black text-xs uppercase tracking-wide">
                                    <PartyPopper size={15} strokeWidth={2.5} />
                                    خطوة {stepIndex + 1} من {steps.length}
                                </div>
                                <button onClick={onClose} aria-label="إغلاق" className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors">
                                    <X size={16} strokeWidth={2.5} />
                                </button>
                            </div>

                            <h4 className="font-black text-[15px] mb-1 text-slate-800">{step.title}</h4>
                            <p className="text-[13px] leading-relaxed font-bold text-slate-500">{step.description}</p>

                            {/* نقاط التقدّم */}
                            <div className="flex items-center gap-1.5 my-3">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-2 rounded-full transition-all"
                                        style={{
                                            width: i === stepIndex ? 26 : 8,
                                            backgroundColor: i === stepIndex ? '#58cc02' : '#e5e5e5',
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <button
                                    onClick={onClose}
                                    className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-wide"
                                >
                                    تخطي
                                </button>

                                {/* الزر الثلاثي الأبعاد الشهير: طبقة سفلية داكنة تنزل الزر فعلياً عند الضغط */}
                                <button
                                    onClick={goNext}
                                    onMouseDown={() => setPressed(true)}
                                    onMouseUp={() => setPressed(false)}
                                    onMouseLeave={() => setPressed(false)}
                                    className="relative select-none"
                                    style={{ transform: pressed ? 'translateY(3px)' : 'translateY(0)', transition: 'transform 0.08s ease' }}
                                >
                                    <div
                                        className="px-5 py-2.5 rounded-2xl font-black text-xs text-white flex items-center gap-1.5 uppercase tracking-wide"
                                        style={{
                                            background: '#58cc02',
                                            boxShadow: pressed ? '0 0 0 #46a302' : '0 4px 0 #46a302',
                                        }}
                                    >
                                        {isLast ? 'ننطلق!' : 'التالي'}
                                        {!isLast && <ArrowLeft size={14} strokeWidth={3} />}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
