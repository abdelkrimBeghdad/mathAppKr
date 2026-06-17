import { useState, useEffect } from 'react';
import { Award, Download, CheckCircle, Lock, Star, Trophy, MapPin } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonCard, SkeletonBlock } from '../../components/SkeletonLoader';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import SEO from '../../components/common/SEO';

export default function Certificates() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const { data } = await api.get('/student/structure');
                setFields(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const isFieldCompleted = (field) => {
        const allLessons = field.sections.flatMap(s => s.lessons);
        return allLessons.length > 0 && allLessons.every(l => l.status === 'completed');
    };

    if (loading) return (
        <div className="space-y-8 max-w-4xl mx-auto" dir="rtl">
            <SkeletonBlock className="h-56 w-full" rounded="rounded-[2.5rem]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-10" dir="rtl">
            <SEO
                title="شهاداتي وإنجازاتي"
                description="شهادات التميز الرسمية من منصة النجاح - أكمل جميع دروس المجال للحصول على شهادتك."
            />

            <header className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-[2.5rem] p-10 shadow-xl border-2 text-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />

                <div className="relative z-10 space-y-4">
                    <div className={`w-20 h-20 ${isDark ? 'bg-amber-900/30' : 'bg-amber-100'} rounded-[2rem] flex items-center justify-center mx-auto text-amber-500 mb-6`}>
                        <Award size={48} />
                    </div>
                    <h1 className={`text-4xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'} font-cairo`}>إنجازاتي وشهاداتي</h1>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium max-w-lg mx-auto`}>
                        أكمل جميع دروس المجال بنجاح لتحصل على شهادة التميز الرسمية من المنصة.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {fields.map((field, fieldIdx) => {
                    const completed = isFieldCompleted(field);
                    const totalLessons = field.sections.flatMap(s => s.lessons).length;
                    const completedLessons = field.sections.flatMap(s => s.lessons).filter(l => l.status === 'completed').length;
                    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

                    return (
                        <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: fieldIdx * 0.1 }}
                            className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-[2.5rem] shadow-xl border-2 flex flex-col justify-between group transition-all ${completed ? (isDark ? 'hover:border-emerald-700' : 'hover:border-emerald-300') : (isDark ? 'hover:border-sky-700' : 'hover:border-sky-200')
                                } ${completed ? 'ring-2 ring-emerald-500/20' : ''}`}
                        >
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <h2 className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{field.name}</h2>
                                    {completed ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 300, delay: fieldIdx * 0.1 + 0.3 }}
                                        >
                                            <CheckCircle className="text-emerald-500 stroke-[3]" size={28} />
                                        </motion.div>
                                    ) : (
                                        <Lock className={isDark ? 'text-slate-600' : 'text-slate-200'} size={28} />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className={`flex justify-between text-xs font-black ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <span>التقدم المحقق</span>
                                        <span>{completedLessons} / {totalLessons} درس</span>
                                    </div>
                                    <div className={`h-3 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full overflow-hidden`}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, delay: fieldIdx * 0.1 + 0.2, ease: 'easeOut' }}
                                            className={clsx(
                                                "h-full rounded-full transition-all",
                                                completed ? "bg-emerald-500" : "bg-sky-500"
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={!completed}
                                onClick={() => window.print()}
                                className={clsx(
                                    "mt-8 w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all",
                                    completed
                                        ? `${isDark ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800'} text-white shadow-xl hover:-translate-y-1 active:translate-y-0`
                                        : `${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'} cursor-not-allowed`
                                )}
                            >
                                <Download size={20} />
                                {completed ? 'عرض وتحميل الشهادة' : 'أكمل المسار للمطالبة بها'}
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Printable Certificate Template */}
            <div className="hidden print:block fixed inset-0 bg-white z-[1000] p-20 text-right dir-rtl" style={{ direction: 'rtl' }}>
                <div className="border-[15px] border-double border-amber-500 p-20 h-full flex flex-col items-center justify-center text-center space-y-12">
                    <div className="text-amber-600 font-serif text-3xl mb-4 italic">شهادة إتمام وتفوق</div>
                    <div className="text-6xl font-black text-slate-900 font-cairo">شهادة تميز</div>
                    <p className="text-2xl text-slate-600 font-medium">نُشهد بكل فخر أن الطالب المتميز:</p>
                    <div className="text-5xl font-black border-b-4 border-slate-900 pb-4 px-10 min-w-[400px]">
                        {user?.name}
                    </div>
                    <p className="text-2xl text-slate-600 font-medium max-w-2xl leading-relaxed">
                        قد أتم بنجاح كافة الدروس والاختبارات المقررة في مجال الرياضيات المتقدم، وأظهر كفاءة عالية وتفوقاً ملحوظاً في مسار السنة الرابعة متوسط.
                    </p>

                    <div className="grid grid-cols-2 gap-20 w-full mt-20">
                        <div className="space-y-4">
                            <div className="text-slate-400 font-bold uppercase tracking-wider text-sm">تاريخ الأصدار</div>
                            <div className="text-xl font-bold">{new Date().toLocaleDateString('ar-DZ')}</div>
                        </div>
                        <div className="space-y-4">
                            <div className="text-slate-400 font-bold uppercase tracking-wider text-sm">ختم المنصة</div>
                            <div className="w-24 h-24 bg-sky-500 rounded-full mx-auto flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-sky-500/30 rotate-12">ن</div>
                        </div>
                    </div>

                    <div className="absolute top-10 right-10 opacity-10">
                        <Award size={300} />
                    </div>
                </div>
            </div>
        </div>
    );
}
