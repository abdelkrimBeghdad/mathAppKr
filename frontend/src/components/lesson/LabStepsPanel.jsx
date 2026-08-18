/**
 * LabStepsPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * لوحة جانبية اختيارية تعرض سجل الخطوات المتراكمة لمختبرات الخوارزميات
 * (القسمة الإقليدية، حل الأنظمة بالتعويض/الجمع، إلخ).
 *
 * تُستخدم فقط داخل <LabChallenge> — وليست بديلاً عنه. تُمرَّر كـ prop
 * إضافي اسمه `sidePanel`، وتشترك بنفس نظام التصميم بالضبط (theme.card,
 * نفس الحدود، نفس الخطوط) حتى لا تخلق تبايناً بصرياً مع بقية المختبرات.
 *
 * الاستخدام:
 *  <LabChallenge
 *    ...
 *    sidePanel={
 *      <LabStepsPanel
 *        title="سجل القسمة"
 *        steps={[
 *          { label: '48 = 1 × 30 + 18', done: true },
 *          { label: '30 = 1 × 18 + 12', done: true },
 *          { label: '18 = 1 × 12 + 6',  done: false, active: true },
 *        ]}
 *      />
 *    }
 *  >
 *    {... المحتوى الأساسي كالمعتاد ...}
 *  </LabChallenge>
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronLeft } from 'lucide-react';
import { useLabTheme } from './LabThemeContext';

export default function LabStepsPanel({ title = 'سجل الخطوات', steps = [] }) {
    const { theme, isDarkMode } = useLabTheme();

    if (!steps.length) return null;

    return (
        <div className={`w-full md:w-56 flex-shrink-0 p-3 sm:p-4 rounded-[1.25rem] border shadow-lg backdrop-blur-3xl ${theme.card} flex flex-col max-h-[190px] md:max-h-[270px]`}>
            <h4 className={`text-xs font-black tracking-wide mb-2.5 shrink-0 text-center ${theme.textMain}`}>
                {title}
            </h4>

            <ol className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar flex-1 pr-0.5" aria-label={title}>
                <AnimatePresence initial={false}>
                    {steps.map((step, i) => (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`flex items-center gap-2 text-xs font-mono px-2 py-1 rounded-lg border transition-all ${
                                step.active
                                    ? isDarkMode
                                        ? 'bg-white/10 border-white/25 text-white font-bold shadow-sm'
                                        : 'bg-slate-100 border-slate-300 text-slate-900 font-bold shadow-sm'
                                    : step.done
                                        ? isDarkMode
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : `border-transparent opacity-40 ${theme.textSub}`
                            }`}
                            dir="ltr"
                            aria-current={step.active ? 'step' : undefined}
                        >
                            {step.done ? (
                                <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                            ) : step.active ? (
                                <ChevronLeft size={12} className="flex-shrink-0 text-indigo-400" />
                            ) : (
                                <Circle size={12} className="flex-shrink-0 opacity-40" />
                            )}
                            <span className="truncate">{step.label}</span>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ol>
        </div>
    );
}
