import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Pin, Lock, Unlock, Shield, Filter, Search, MessageCircle, CheckCircle, ChevronRight, AlertCircle, BarChart3 } from 'lucide-react';
import api from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForumModerator() {
    const [questions, setQuestions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [activeQuestion, setActiveQuestion] = useState(null);

    const fetchData = async () => {
        try {
            const [quesRes, statsRes] = await Promise.all([
                api.get(`/admin/forum/questions?page=${page}`),
                api.get('/admin/forum/stats')
            ]);
            setQuestions(quesRes.data.data);
            setStats(statsRes.data);
        } catch (e) {
            toast.error('فشل في تحميل بيانات المنتدى');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا السؤال نهائياً؟')) return;
        try {
            await api.delete(`/admin/forum/questions/${id}`);
            toast.success('تم حذف السؤال بنجاح');
            if (activeQuestion?.id === id) setActiveQuestion(null);
            fetchData();
        } catch (e) {
            toast.error('فشل في حذف السؤال');
        }
    };

    const handleDeleteAnswer = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الرد؟')) return;
        try {
            await api.delete(`/admin/forum/answers/${id}`);
            toast.success('تم حذف الرد بنجاح');
            fetchData();
        } catch (e) {
            toast.error('فشل في حذف الرد');
        }
    };

    const handleTogglePin = async (question) => {
        try {
            const { data } = await api.post(`/admin/forum/questions/${question.id}/pin`);
            toast.success(data.message);
            fetchData();
        } catch (e) {
            toast.error('فشل في تعديل حالة التثبيت');
        }
    };

    const handleToggleLock = async (question) => {
        try {
            const { data } = await api.post(`/admin/forum/questions/${question.id}/lock`);
            toast.success(data.message);
            fetchData();
        } catch (e) {
            toast.error('فشل في تعديل حالة القفل');
        }
    };

    if (loading) return <LoadingScreen message="جاري تحميل إدارة المنتدى..." />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-cairo" dir="rtl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">إدارة المنتدى 💬</h1>
                    <p className="text-slate-500 font-medium">مراجعة الأسئلة، تثبيت المواضيع المهمة، وتنظيم النقاشات.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="text-primary-500" size={18} />
                        <span className="text-sm font-black text-slate-700">{stats?.total_questions} سؤال</span>
                    </div>
                    <div className="w-px h-6 bg-slate-100" />
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-emerald-500" size={18} />
                        <span className="text-sm font-black text-slate-700">{stats?.solved_questions} مجاب</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Questions List */}
                <div className="lg:col-span-12 space-y-4">
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50/50 border-b border-slate-100 font-black text-slate-400 text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">السؤال</th>
                                        <th className="px-6 py-5">صاحب السؤال</th>
                                        <th className="px-6 py-5">التفاعلات</th>
                                        <th className="px-6 py-5">الحالة</th>
                                        <th className="px-8 py-5">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {questions.map((q) => (
                                        <tr key={q.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="font-black text-slate-800 line-clamp-1">{q.title}</div>
                                                <div className="text-[10px] text-slate-400 font-bold mt-1">
                                                    {format(new Date(q.created_at), 'yyyy/MM/dd HH:mm')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-black text-xs">
                                                        {q.user.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600">{q.user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4 text-slate-400">
                                                    <span className="flex items-center gap-1 text-xs font-bold">
                                                        <MessageCircle size={14} /> {q.answers_count}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs font-bold">
                                                        <BarChart3 size={14} /> {q.votes_count}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    {q.is_pinned && <Pin size={14} className="text-amber-500" />}
                                                    {q.is_locked && <Lock size={14} className="text-rose-500" />}
                                                    {q.is_solved && <CheckCircle size={14} className="text-emerald-500" />}
                                                    {!q.is_pinned && !q.is_locked && !q.is_solved && <span className="text-xs text-slate-300 font-bold">عادي</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleTogglePin(q)}
                                                        className={clsx("p-2 rounded-xl transition-all", q.is_pinned ? "text-amber-500 bg-amber-50 ring-1 ring-amber-200" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50")}
                                                        title={q.is_pinned ? "إلغاء التثبيت" : "تثبيت السؤال"}
                                                    >
                                                        <Pin size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleLock(q)}
                                                        className={clsx("p-2 rounded-xl transition-all", q.is_locked ? "text-rose-500 bg-rose-50 ring-1 ring-rose-200" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50")}
                                                        title={q.is_locked ? "إلغاء القفل" : "قفل الموضوع"}
                                                    >
                                                        {q.is_locked ? <Lock size={18} /> : <Unlock size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteQuestion(q.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="حذف نهائي"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveQuestion(q)}
                                                        className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                                                        title="عرض الردود"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Answer Moderation Panel */}
            <AnimatePresence>
                {activeQuestion && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed inset-y-0 left-0 w-full max-w-xl bg-white shadow-2xl z-[150] border-r border-slate-100 flex flex-col"
                    >
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">مراجعة الردود</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 line-clamp-1">{activeQuestion.title}</p>
                            </div>
                            <button
                                onClick={() => setActiveQuestion(null)}
                                className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 transition-all text-slate-400"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {activeQuestion.answers?.length > 0 ? (
                                activeQuestion.answers.map((answer) => (
                                    <div key={answer.id} className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-primary-100 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-primary-500 border border-slate-100">
                                                    {answer.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-700">{answer.user.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold">{format(new Date(answer.created_at), 'yyyy/MM/dd HH:mm')}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAnswer(answer.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="text-sm text-slate-600 font-medium leading-relaxed pr-2">
                                            {answer.content}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-slate-300">
                                    <MessageCircle className="mx-auto mb-4 opacity-20" size={64} />
                                    <p className="font-bold">لا توجد ردود على هذا السؤال بعد.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
