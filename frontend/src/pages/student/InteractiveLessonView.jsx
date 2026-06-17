import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import InteractiveMathLesson from '../../components/lesson/InteractiveMathLesson';
import AITutorWidget from '../../components/AITutorWidget';
import Calculator from '../../components/Calculator';
import LoadingScreen from '../../components/LoadingScreen';
import SEO from '../../components/common/SEO';
import { motion } from 'framer-motion';
import { ArrowRight, Calculator as CalcIcon, Loader2, BookOpen } from 'lucide-react';
import echo from '../../echo';

const QuizModal = lazy(() => import('../../components/QuizModal'));

// --- بيانات تجريبية للمعاينة ---
const DEMO_INTERACTIVE_STEPS = [
    {
        type: 'calculation',
        title: 'المعادلة الأصلية',
        text: 'لنحل المعادلة التالية:',
        math: '2x + 6 = 14',
        reasoning: {
            type: 'property',
            text: 'هذه معادلة من الدرجة الأولى بمجهول واحد. هدفنا هو إيجاد قيمة $x$',
            learnMore: 'المعادلة من الدرجة الأولى هي معادلة يكون فيها أعلى أس للمجهول هو 1. شكلها العام: $ax + b = c$',
        },
    },
    {
        type: 'calculation',
        title: 'نقل الثوابت',
        text: 'ننقل العدد $6$ إلى الطرف الآخر مع تغيير إشارته:',
        math: '2x = 14 - 6',
        mathSteps: [
            { expression: '2x + 6 = 14', explanation: 'المعادلة الأصلية' },
            { expression: '2x = 14 - 6', explanation: 'نقلنا $+6$ إلى الطرف الأيمن فأصبح $-6$', operation: 'نقل الحد' },
            { expression: '2x = 8', explanation: 'حسبنا $14 - 6 = 8$' },
        ],
        reasoning: {
            type: 'rule',
            text: 'عند نقل حد من طرف إلى آخر في المعادلة، نغيّر إشارته: الموجب يصبح سالباً والعكس صحيح ✨',
        },
    },
    {
        type: 'interaction',
        title: 'دورك! ما نتيجة 14 - 6؟',
        text: 'احسب الطرف الأيمن:',
        math: '2x = 14 - 6 = \\text{?}',
        interaction: {
            type: 'multiple_choice',
            question: 'ما هي نتيجة $14 - 6$؟',
            correctAnswer: '8',
            options: ['6', '8', '10', '20'],
            hints: [
                'العملية بسيطة: اطرح 6 من 14',
                'العد التنازلي: 14, 13, 12, 11, 10, 9, 8',
                'الجواب هو $14 - 6 = 8$',
            ],
        },
    },
    {
        type: 'calculation',
        title: 'القسمة على المعامل',
        text: 'نقسم طرفي المعادلة على معامل $x$ وهو $2$:',
        math: 'x = \\frac{8}{2}',
        mathSteps: [
            { expression: '2x = 8', explanation: 'المعادلة المبسطة' },
            { expression: '\\frac{2x}{2} = \\frac{8}{2}', explanation: 'نقسم الطرفين على $2$', operation: '÷ بالطرفين' },
            { expression: 'x = 4', explanation: 'النتيجة: $x = 4$ ✨' },
        ],
        reasoning: {
            type: 'rule',
            text: 'لعزل المجهول، نقسم طرفي المعادلة على معامله (العدد المضروب فيه)',
        },
    },
    {
        type: 'interaction',
        title: 'دورك! ما قيمة x؟',
        text: 'اكتب قيمة $x$:',
        interaction: {
            type: 'text',
            question: 'ما هي قيمة $x$ في المعادلة $2x + 6 = 14$؟',
            correctAnswer: '4',
            placeholder: 'اكتب الجواب...',
            hints: [
                'راجع الخطوات السابقة',
                'قسّم 8 على 2',
                'الجواب هو $x = 4$',
            ],
        },
    },
    {
        type: 'result',
        title: 'التحقق من الحل',
        text: 'نتحقق بتعويض $x = 4$ في المعادلة الأصلية:',
        math: '2(4) + 6 = 8 + 6 = 14 \\checkmark',
        reasoning: {
            type: 'tip',
            text: 'دائماً تحقق من حلك بتعويض القيمة في المعادلة الأصلية! إذا تساوى الطرفان فالحل صحيح ✅',
        },
    },
];

export default function InteractiveLessonView() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCalc, setShowCalc] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [useDemo, setUseDemo] = useState(false);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const { data } = await api.get(`/student/lessons/${lessonId}`);
                setLesson(data);
                // إذا لا يوجد بيانات تفاعلية، استخدم البيانات التجريبية
                if (!data.interactive_steps) {
                    setUseDemo(true);
                }
            } catch (e) {
                console.error(e);
                // في حالة الخطأ، استخدم البيانات التجريبية
                setUseDemo(true);
                setLesson({
                    id: lessonId,
                    name: 'حل معادلة من الدرجة الأولى',
                    summary: 'تعلّم كيف تحل المعادلات من الدرجة الأولى بمجهول واحد خطوة بخطوة',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [lessonId]);

    // اتصال الطالب بالغرفة الخاصة بالدرس لتسجيل حضوره
    useEffect(() => {
        if (!lessonId) return;

        const channel = echo.join(`lesson.${lessonId}`);

        return () => {
            echo.leave(`lesson.${lessonId}`);
        };
    }, [lessonId]);

    if (loading) return <LoadingScreen message="جاري تحميل الدرس التفاعلي..." />;

    const lessonData = {
        ...lesson,
        interactive_steps: useDemo ? DEMO_INTERACTIVE_STEPS : lesson.interactive_steps,
    };

    return (
        <div className="min-h-screen pb-20">
            <SEO
                title={`${lesson?.name || 'درس تفاعلي'} — التعلم خطوة بخطوة`}
                description={lesson?.summary || 'درس رياضيات تفاعلي بصري'}
                keywords="رياضيات, درس تفاعلي, حل معادلات, متوسط"
            />

            {/* شريط التنقل العلوي */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link
                        to="/student"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-all font-bold text-sm group"
                    >
                        <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                        العودة
                    </Link>

                    <div className="flex items-center gap-3">
                        {/* رابط للنسخة الكلاسيكية */}
                        <Link
                            to={`/student/lessons/${lessonId}`}
                            className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
                        >
                            <BookOpen size={14} />
                            النسخة الكلاسيكية
                        </Link>
                    </div>
                </div>
            </div>

            {/* عنوان الدرس */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-2">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-5 md:p-7 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📐</span>
                            <span className="text-xs font-bold text-sky-500 bg-sky-50 dark:bg-sky-500/15 px-2.5 py-1 rounded-full">
                                درس تفاعلي
                            </span>
                        </div>
                        <h1 className="text-xl md:text-3xl font-black text-slate-800 dark:text-slate-100">
                            {lesson?.name || 'درس تفاعلي'}
                        </h1>
                        {lesson?.summary && (
                            <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
                                {lesson.summary}
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* المحتوى التفاعلي الرئيسي */}
            <InteractiveMathLesson
                lessonData={lessonData}
                onComplete={() => navigate('/student')}
                onQuiz={() => setShowQuiz(true)}
            />

            {/* أدوات عائمة */}
            <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
                <button
                    onClick={() => setShowCalc(!showCalc)}
                    className="w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 group"
                    title="الآلة الحاسبة"
                >
                    <CalcIcon className="group-hover:rotate-12 transition-transform" />
                </button>
            </div>

            {/* الآلة الحاسبة */}
            {showCalc && <Calculator onClose={() => setShowCalc(false)} />}

            {/* الاختبار */}
            {showQuiz && (
                <Suspense fallback={
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-sky-500" size={32} />
                            <p className="text-slate-700 dark:text-slate-200 font-bold">جاري تحميل الاختبار...</p>
                        </div>
                    </div>
                }>
                    <QuizModal
                        lessonId={lesson?.id || lessonId}
                        lessonName={lesson?.name}
                        onClose={() => setShowQuiz(false)}
                    />
                </Suspense>
            )}

            {/* المساعد الذكي */}
            <AITutorWidget contextId={lesson?.id || lessonId} type="lesson" />
        </div>
    );
}
