/**
 * LabTutorialNote.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * مكوّن مشترك صغير يُستخدم أسفل أي حقل إدخال في أي مختبر داخل mastryworld.
 * هدفه الإجابة دائماً على سؤال المتعلم: "من أين أتت هذه القيمة، ولماذا أدخلها هنا؟"
 * بدل ترك المتعلم تائهاً أمام حقل فارغ.
 *
 * الاستخدام:
 *  <LabTutorialNote
 *    from="معامل y في المعادلة الثانية"      // من أين أتت القيمة
 *    why="لنجعل معاملي y متعاكسين فيلغيان بعضهما عند الجمع"  // لماذا نحتاجها هنا
 *  />
 *
 * تصميم مقصود: نص صغير وثابت (ليس tooltip يختفي) حتى لا يفوّت المتعلم المبتدئ
 * الشرح بسبب عدم معرفته أن هناك تلميحاً قابلاً للنقر.
 */
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useLabTheme } from './LabThemeContext';

export default function LabTutorialNote({ from, why }) {
    const { isDarkMode } = useLabTheme();
    if (!from && !why) return null;

    return (
        <div
            className={`w-full max-w-md text-right rounded-xl border px-3 py-2 flex items-start gap-2 ${isDarkMode
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'
                    : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                }`}
            dir="rtl"
        >
            <Lightbulb size={14} className="shrink-0 mt-0.5 opacity-70" />
            <p className="text-[11px] leading-relaxed font-medium">
                {from && <span className="font-black">من أين؟ </span>}
                {from}
                {from && why && <span className="opacity-50"> — </span>}
                {why && <span className="font-black">لماذا؟ </span>}
                {why}
            </p>
        </div>
    );
}
