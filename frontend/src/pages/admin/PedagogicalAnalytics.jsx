import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Users, BookOpen, GraduationCap, ChevronRight, Activity, Target, BrainCircuit, Calendar } from 'lucide-react';
import api from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function PedagogicalAnalytics() {
    const [summary, setSummary] = useState(null);
    const [deepInsights, setDeepInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, insightsRes] = await Promise.all([
                api.get('/admin/analytics/stats'),
                api.get('/admin/analytics/deep-insights')
            ]);
            setSummary(statsRes.data);
            setDeepInsights(insightsRes.data);
        } catch (e) {
            toast.error('فشل في تحميل التحليلات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <LoadingScreen message="جاري تحليل البيانات البيداغوجية..." />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-cairo text-right" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">التحليلات البيداغوجية 📊</h1>
                    <p className="text-slate-500 font-medium">نظرة عميقة على أداء الطلاب، صعوبة المنهج، ومعدلات النجاح.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <Activity size={16} /> مباشر الآن
                    </div>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'متوسط النتائج', value: `${Math.round(summary?.summary.avg_quiz_score)}%`, icon: Target, color: 'text-sky-500', bg: 'bg-sky-50' },
                    { label: 'الدروس المكتملة', value: summary?.summary.lessons_completed, icon: BookOpen, color: 'text-primary-500', bg: 'bg-primary-50' },
                    { label: 'تفاعل الطلاب', value: 'نشط جداً', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'إجمالي النقاط', value: summary?.summary.total_points_distributed, icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500", stat.bg, stat.color)}>
                            <stat.icon size={28} />
                        </div>
                        <div className="text-slate-400 text-sm font-bold">{stat.label}</div>
                        <div className="text-3xl font-black text-slate-800 mt-1">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Difficulty Analysis */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                    <AlertTriangle size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">تحليل الصعوبة (الدروس الأكثر تحدياً)</h3>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {deepInsights?.difficult_lessons.map((lesson) => (
                                <div key={lesson.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-rose-200 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="font-black text-slate-700 line-clamp-1">{lesson.name}</div>
                                        <div className="text-rose-600 bg-white px-2 py-1 rounded-lg text-xs font-black shadow-sm">
                                            {Math.round(lesson.quiz_results_avg_score)}%
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-3">
                                        <div
                                            className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${lesson.quiz_results_avg_score}%` }}
                                        />
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold">
                                        محاولات الطلاب: {lesson.quiz_results_count} محاولة
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress Funnel */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden h-full">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">قمع التقدم (الوصول للمجالات)</h3>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            {deepInsights?.funnel.map((step, i) => (
                                <div key={i} className="relative">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                                                {i + 1}
                                            </span>
                                            <span className="font-black text-slate-700">{step.field}</span>
                                        </div>
                                        <div className="text-sm font-black text-slate-400">
                                            {step.students_reached} طالب ({step.reach_percent}%)
                                        </div>
                                    </div>
                                    <div className="w-full h-4 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${step.reach_percent}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-l from-indigo-500 to-primary-500 rounded-2xl"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Field Breakdown */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden h-full">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                    <BrainCircuit size={20} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800">الأداء حسب المجال</h3>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            {summary?.field_performance.map((field, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-bold text-slate-600">{field.name}</span>
                                            <span className="text-xs font-black text-slate-900">{Math.round(field.avg_score)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 rounded-full group-hover:bg-amber-600 transition-colors"
                                                style={{ width: `${field.avg_score}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
