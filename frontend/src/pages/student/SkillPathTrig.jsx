/**
 * SkillPathTrig.jsx — PROTOTYPE (تجريبي)
 * ─────────────────────────────────────────────────────────────────────────────
 * تجربة بديلة لعرض كتالوج المختبرات: بدل شبكة بطاقات مسطحة متساوية الوزن،
 * مسار متعرّج (نمط Duolingo/Khan Academy) يعطي إحساساً بـ"الرحلة" ويقفل
 * المختبرات تصاعدياً حتى إتمام ما قبلها.
 *
 * هذا نموذج تجريبي على قسم "المثلثات" (8 مختبرات) فقط، لتقييم الفكرة قبل
 * تعميمها على الكتالوج كاملاً. لا يستبدل MasteryWorld.jsx — مكوّن مستقل.
 *
 * منطق القفل: كل عقدة تُفتح تلقائياً بعد إكمال العقدة السابقة (phase==='completed').
 * أول عقدة مفتوحة دائماً. هذا سلوك جديد غير موجود في الكتالوج الحالي (المسطّح
 * لا يقفل شيئاً) — أُضيف هنا كجزء من التجربة نفسها.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Play, Star, Sparkles } from 'lucide-react';
import { labProgressService } from '../../utils/labProgressService';
import { useTheme } from '../../context/ThemeContext';

const TRIG_LABS = [
    { id: 'trig-naming', title: 'تسمية الأضلاع', difficulty: 'مبتدئ', desc: 'تحديد المقابل والمجاور والوتر.' },
    { id: 'trig-cos', title: 'جيب التمام (Cos)', difficulty: 'مبتدئ', desc: 'حساب نسبة المجاور إلى الوتر.' },
    { id: 'trig-sin', title: 'الجيب (Sin)', difficulty: 'مبتدئ', desc: 'حساب نسبة المقابل إلى الوتر.' },
    { id: 'trig-tan', title: 'الظل (Tan)', difficulty: 'مبتدئ', desc: 'حساب نسبة المقابل إلى المجاور.' },
    { id: 'trig-length', title: 'حساب الأطوال', difficulty: 'متوسط', desc: 'إيجاد أضلاع مجهولة بالنسب.' },
    { id: 'trig-angle', title: 'استنتاج الزوايا', difficulty: 'متوسط', desc: 'حساب الدرجات من النسب.' },
    { id: 'trig-identities', title: 'العلاقات الأساسية', difficulty: 'متقدم', desc: 'القوانين التي تربط النسب ببعضها.' },
    { id: 'trig-special', title: 'الزوايا الشهيرة', difficulty: 'متقدم', desc: 'حفظ وفهم قيم 30, 45, 60.' },
];

// إزاحة أفقية متعرّجة يمينًا/يسارًا لكل عقدة (نمط Duolingo الكلاسيكي)
const ZIGZAG_OFFSETS = [0, 60, 90, 60, 0, -60, -90, -60];

const DIFFICULTY_COLOR = {
    'مبتدئ': { ring: 'ring-emerald-400', bg: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    'متوسط': { ring: 'ring-amber-400', bg: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    'متقدم': { ring: 'ring-rose-400', bg: 'bg-rose-500', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

export default function SkillPathTrig({ onOpenLab }) {
    const { isDark } = useTheme();
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        labProgressService.getAll()
            .then(data => setProgress(data || []))
            .catch(() => setProgress([]))
            .finally(() => setLoading(false));
    }, []);

    // يحسب حالة كل عقدة: completed | unlocked | locked
    const nodes = useMemo(() => {
        let previousCompleted = true; // أول عقدة مفتوحة دائماً
        return TRIG_LABS.map((lab) => {
            const p = progress.find(item => item.lab_id === lab.id);
            const isCompleted = p?.phase === 'completed';
            const status = isCompleted ? 'completed' : (previousCompleted ? 'unlocked' : 'locked');
            previousCompleted = isCompleted;
            return { ...lab, status, bestScore: p?.best_score ?? null };
        });
    }, [progress]);

    const completedCount = nodes.filter(n => n.status === 'completed').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className={`w-full max-w-lg mx-auto px-4 py-8 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {/* رأس القسم */}
            <div className="text-center mb-10">
                <h2 className="text-xl font-black mb-1">مسار المثلثات</h2>
                <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {completedCount} من {TRIG_LABS.length} مكتملة
                </p>
                <div className={`h-2 rounded-full mt-3 overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount / TRIG_LABS.length) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* المسار المتعرّج */}
            <div className="relative flex flex-col items-center gap-2">
                {nodes.map((node, i) => {
                    const colors = DIFFICULTY_COLOR[node.difficulty];
                    const isFirstOfDifficulty = i === 0 || nodes[i - 1].difficulty !== node.difficulty;

                    return (
                        <React.Fragment key={node.id}>
                            {/* شارة محطة عند بداية كل مستوى صعوبة */}
                            {isFirstOfDifficulty && (
                                <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border my-3 ${colors.badge}`}>
                                    محطة: {node.difficulty}
                                </div>
                            )}

                            <motion.button
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => node.status !== 'locked' && onOpenLab?.(node.id)}
                                disabled={node.status === 'locked'}
                                style={{ transform: `translateX(${ZIGZAG_OFFSETS[i % ZIGZAG_OFFSETS.length]}px)` }}
                                aria-label={`${node.title} — ${node.status === 'locked' ? 'مقفل' : node.status === 'completed' ? 'مكتمل' : 'متاح'}`}
                                className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all
                                    ${node.status === 'locked'
                                        ? `${isDark ? 'bg-white/5' : 'bg-slate-200'} cursor-not-allowed opacity-60`
                                        : node.status === 'completed'
                                            ? `${colors.bg} shadow-lg cursor-pointer active:scale-95`
                                            : `${colors.bg} shadow-xl cursor-pointer active:scale-95 ring-4 ring-offset-2 ${colors.ring} ${isDark ? 'ring-offset-slate-900' : 'ring-offset-white'}`
                                    }`}
                            >
                                {/* نبضة توهّج للعقدة "التالية" فقط */}
                                {node.status === 'unlocked' && (
                                    <motion.span
                                        className={`absolute inset-0 rounded-full ${colors.bg}`}
                                        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                )}

                                <span className="relative z-10 text-white">
                                    {node.status === 'locked' ? <Lock size={20} /> : node.status === 'completed' ? <Check size={22} strokeWidth={3} /> : <Play size={20} fill="white" />}
                                </span>
                                {node.status === 'completed' && node.bestScore != null && (
                                    <span className="relative z-10 flex items-center gap-0.5 text-white text-[10px] font-black">
                                        <Star size={10} fill="white" /> {node.bestScore}%
                                    </span>
                                )}
                            </motion.button>

                            {/* عنوان العقدة */}
                            <div
                                style={{ transform: `translateX(${ZIGZAG_OFFSETS[i % ZIGZAG_OFFSETS.length]}px)` }}
                                className={`text-center max-w-[140px] ${node.status === 'locked' ? 'opacity-50' : ''}`}
                            >
                                <p className="text-xs font-black">{node.title}</p>
                                {node.status === 'unlocked' && (
                                    <p className="text-[10px] font-bold text-indigo-400 flex items-center justify-center gap-1 mt-0.5">
                                        <Sparkles size={10} /> ابدأ هنا
                                    </p>
                                )}
                            </div>

                            {/* خط الوصل للعقدة التالية */}
                            {i < nodes.length - 1 && (
                                <div className={`w-1 h-6 rounded-full ${node.status === 'completed' ? colors.bg : isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
