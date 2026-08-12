/**
 * WelcomeBanner.jsx — PROTOTYPE (تجريبي)
 * ─────────────────────────────────────────────────────────────────────────────
 * حالة ترحيب لأول استخدام: تحققت من MasteryWorld.jsx فوجدت أنه لا توجد حالياً
 * أي شاشة "فراغ مصمَّم" عند labProgress.length === 0 — الطالب الجديد يرى نفس
 * شبكة الفئات مباشرة بلا أي توجيه أو ترحيب، وهذه فرصة ضائعة في أهم 30 ثانية
 * من تجربته الأولى.
 *
 * مكوّن مستقل تماماً — لا يعدّل MasteryWorld.jsx. يُعرض فقط عند فراغ التقدّم،
 * ويختفي تلقائياً (localStorage) بعد أول محاولة فعلية أو بعد إغلاقه يدوياً.
 *
 * إصلاح خلل حقيقي (ظهور لحظي ثم اختفاء تلقائي بلا تسجيل بـlocalStorage):
 * الاستخدام الساذج `{labProgress.length === 0 && <WelcomeBanner/>}` يجعل
 * البانر يظهر فوراً قبل اكتمال الجلب (labProgress = [] ابتدائياً)، ثم يختفي
 * بمجرد وصول بيانات حقيقية غير فارغة — دون أي تدخل من المستخدم، ودون أي
 * كتابة بـlocalStorage لأن ذلك يحدث فقط داخل handleDismiss.
 *
 * الحل: خاصية `show` أصبحت ثلاثية الحالة:
 *   - undefined/null  → لا يزال التحميل جارياً، لا تقرر شيئاً بعد
 *   - true             → أظهر البانر (إن لم يكن مغلَقاً سابقاً)
 *   - false            → لا تُظهره إطلاقاً لهذه الجلسة (كان هناك تقدّم فعلي)
 * بمجرد ما يقرر المكوّن "أظهر" لأول مرة، يُثبّت هذا القرار داخلياً (latch)
 * ولا يتراجع عنه حتى لو تغيّرت قيمة show لاحقاً من الأب — الإغلاق الوحيد
 * الممكن بعدها هو ضغط المستخدم الفعلي على زر الإغلاق.
 *
 * الاستخدام الصحيح المُحدَّث داخل MasteryWorld.jsx:
 *   const showWelcome = loading ? undefined : labProgress.length === 0;
 *   <WelcomeBanner
 *     show={showWelcome}
 *     studentName={user?.name}
 *     recommendedCategory={CATEGORIES.find(c => c.id === 'expansion')}
 *     onStart={() => setActiveCategory('expansion')}
 *   />
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowLeft, Trophy, Zap, Target } from 'lucide-react';

const DISMISS_KEY = 'mw_welcome_dismissed';

export default function WelcomeBanner({ show, studentName, recommendedCategory, onStart, isDark = true }) {
    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
    });
    // القرار مثبَّت بمجرد اتخاذه لأول مرة — لا يتراجع البانر تلقائياً بعدها
    const [latchedVisible, setLatchedVisible] = useState(false);
    const decided = useRef(false);

    useEffect(() => {
        if (decided.current) return; // قرار سابق مثبَّت، تجاهل أي تحديثات لاحقة لـ show
        if (show === true) {
            decided.current = true;
            setLatchedVisible(true);
        } else if (show === false) {
            decided.current = true;
            setLatchedVisible(false);
        }
        // show === undefined/null → لا تزال البيانات تُحمَّل، لا تقرر بعد
    }, [show]);

    const handleDismiss = () => {
        setDismissed(true);
        try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    };

    if (dismissed || !latchedVisible) return null;

    const Icon = recommendedCategory?.icon || Target;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={`relative overflow-hidden rounded-[2rem] border mb-8 ${isDark ? 'bg-gradient-to-br from-indigo-600/20 via-slate-900 to-slate-900 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-lg'}`}
            >
                {/* زخرفة خلفية بسيطة */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

                <button
                    onClick={handleDismiss}
                    aria-label="إغلاق رسالة الترحيب"
                    className={`absolute top-4 left-4 z-10 p-1.5 rounded-full transition-colors ${isDark ? 'text-white/30 hover:text-white/70 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                >
                    <X size={16} />
                </button>

                <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <Sparkles size={28} />
                    </div>

                    <div className="flex-1 text-center md:text-right">
                        <h2 className={`text-lg md:text-xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {studentName ? `أهلاً بك، ${studentName}! 👋` : 'أهلاً بك في MasteryWorld! 👋'}
                        </h2>
                        <p className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                            أكثر من 75 مختبراً تفاعلياً بانتظارك. كل مختبر يبدأ بشرح مبسّط، ثم تدريب تصاعدي الصعوبة، وتنتهي بمكافأة حقيقية.
                        </p>

                        {/* تلميحات سريعة لنظام المكافآت — مرة واحدة فقط */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                <Zap size={13} className="text-amber-400" /> عملات عند كل إنجاز
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                <Trophy size={13} className="text-emerald-400" /> شارات إنجاز
                            </div>
                        </div>

                        {recommendedCategory && (
                            <button
                                onClick={onStart}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                            >
                                <Icon size={16} />
                                ابدأ بـ«{recommendedCategory.title}»
                                <ArrowLeft size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
