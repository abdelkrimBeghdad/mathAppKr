import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye, CheckCircle, Plus, Search, Sparkles } from 'lucide-react';
import axios from '../../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { arDZ } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonForum } from '../../components/SkeletonLoader';
import Pagination from '../../components/common/Pagination';
import SEO from '../../components/common/SEO';

const Forum = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { isDark } = useTheme();

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/forum?filter=${filter}&page=${page}`);
            setQuestions(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error("Error fetching questions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [filter, page]);

    const handleVote = async (id, value) => {
        try {
            await axios.post(`/forum/${id}/vote`, { value });
            fetchQuestions();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <SkeletonForum />;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl" dir="rtl">
            <SEO
                title="منتدى النقاش"
                description="شارك أسئلتك وساعد أصدقاءك في فهم الرياضيات على منصة النجاح."
                keywords="منتدى, رياضيات, نقاش, 4AM, أسئلة"
            />

            {/* Hero Header */}
            <div className={`rounded-[2rem] p-8 md:p-10 mb-8 relative overflow-hidden ${isDark ? 'bg-gradient-to-r from-indigo-900/60 to-slate-800' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
                <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
                    <span className="absolute text-6xl font-black top-4 left-[10%]">💬</span>
                    <span className="absolute text-5xl font-black bottom-4 right-[15%]">🤔</span>
                    <span className="absolute text-4xl font-black top-[30%] right-[40%]">💡</span>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 font-cairo">منتدى النقاش</h1>
                        <p className="text-white/70 font-medium">شارك أسئلتك وساعد أصدقاءك في فهم الرياضيات</p>
                    </div>
                    <Link
                        to="/student/forum/create"
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg font-bold hover:-translate-y-1 active:translate-y-0 border border-white/20"
                    >
                        <Plus size={20} />
                        <span>سؤال جديد</span>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { id: 'newest', label: 'الأحدث', icon: '🕐' },
                    { id: 'popular', label: 'الأكثر شعبية', icon: '🔥' },
                    { id: 'unsolved', label: 'غير محلولة', icon: '❓' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => { setFilter(f.id); setPage(1); }}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 ${filter === f.id
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                : `${isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'} border`
                            }`}
                    >
                        <span>{f.icon}</span>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {questions.length > 0 ? (
                    questions.map((q) => (
                        <div key={q.id} className={`${isDark ? 'bg-slate-800 border-slate-700 hover:border-sky-700' : 'bg-white border-slate-100 hover:border-sky-200'} p-6 rounded-[1.5rem] shadow-sm border-2 hover:shadow-lg transition-all group`}>
                            <div className="flex gap-4">
                                {/* Stats Column */}
                                <div className="flex flex-col gap-2 min-w-[70px] text-sm">
                                    <div className={`flex flex-col items-center ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'} p-2.5 rounded-xl border`}>
                                        <span className={`font-black text-lg ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{q.votes_count || 0}</span>
                                        <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>تصويت</span>
                                    </div>
                                    <div className={`flex flex-col items-center p-2.5 rounded-xl border ${q.is_solved
                                            ? (isDark ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600')
                                            : (isDark ? 'bg-slate-900/50 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400')
                                        }`}>
                                        <span className="font-black text-lg">{q.answers_count || 0}</span>
                                        <span className="text-[10px] font-bold">إجابة</span>
                                    </div>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <h3 className={`text-lg md:text-xl font-black ${isDark ? 'text-slate-100 group-hover:text-sky-400' : 'text-slate-800 group-hover:text-sky-600'} transition-colors truncate`}>
                                            <Link to={`/student/forum/${q.id}`}>{q.title}</Link>
                                        </h3>
                                        {q.is_solved && (
                                            <span className={`flex items-center gap-1 text-[10px] font-black shrink-0 px-2.5 py-1 rounded-full ${isDark ? 'text-emerald-400 bg-emerald-900/20' : 'text-emerald-600 bg-emerald-50'}`}>
                                                <CheckCircle size={12} />
                                                تم الحل
                                            </span>
                                        )}
                                    </div>
                                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mb-4 line-clamp-2 text-sm font-medium`}>
                                        {q.content.substring(0, 150)}...
                                    </p>
                                    <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-lg ${isDark ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-50 text-sky-600'} flex items-center justify-center font-black text-[10px]`}>
                                                {q.user.name.charAt(0)}
                                            </div>
                                            <span className="font-bold">{q.user.name}</span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(q.created_at), { addSuffix: true, locale: arDZ })}</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-bold">
                                            <Eye size={14} />
                                            <span>{q.views_count} مشاهدة</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16">
                        <div className={`w-20 h-20 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-[2rem] flex items-center justify-center mx-auto mb-6`}>
                            <MessageSquare size={40} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                        </div>
                        <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>لا توجد أسئلة بعد</h3>
                        <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'} mb-6 font-medium`}>كن أول من يسأل ويفتح باب النقاش!</p>
                        <Link
                            to="/student/forum/create"
                            className="inline-flex items-center gap-2 text-sky-500 font-black hover:text-sky-600 transition-colors"
                        >
                            <Plus size={16} /> طرح سؤال جديد
                        </Link>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
};

export default Forum;
