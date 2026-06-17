import { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, TrendingUp, Trophy, MapPin, Star } from 'lucide-react';
import api from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/admin/analytics/stats');
                setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <LoadingScreen message="جاري تحميل الإحصائيات..." />;

    const stats = [
        { label: 'إجمالي الطلاب', value: data?.summary.total_students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'دروس مكتملة', value: data?.summary.lessons_completed, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'متوسط النتائج', value: `${(data?.summary.avg_quiz_score || 0).toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'نقاط موزعة', value: data?.summary.total_points_distributed, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-800 mb-2 font-cairo">نظرة عامة على المنصة</h1>
                <p className="text-slate-500 font-medium">مرحباً بك مجدداً في لوحة التحكم الإدارية.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                    <Icon size={24} />
                                </div>
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Field Performance Heatmap/List */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-primary-500" />
                        أداء المجالات
                    </h2>
                    <div className="space-y-6">
                        {data?.field_performance.map((field, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-700">{field.name}</span>
                                    <span className="text-slate-400">{field.count} اختبار</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 rounded-full"
                                        style={{ width: `${field.avg_score}%` }}
                                    />
                                </div>
                                <div className="text-xs font-black text-primary-600 text-left">
                                    {field.avg_score.toFixed(1)}% متوسط
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Students */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Trophy className="text-amber-500" />
                        أفضل الطلاب
                    </h2>
                    <div className="space-y-4">
                        {data?.top_students.map((student, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800">{student.name}</div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-lg font-black flex items-center gap-1">
                                            <Star size={10} /> مستوى {student.level}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <MapPin size={10} /> {student.wilaya}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-amber-500">{student.points}</div>
                                    <div className="text-[10px] font-bold text-slate-400">نقطة</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
