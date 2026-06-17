import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, CheckCircle, User, Clock, MessageSquare, Send, ArrowRight, MoreVertical, Flag, ShieldCheck } from 'lucide-react';
import axios from '../../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { arDZ } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import EquationEditor from '../../components/EquationEditor';
import MathText from '../../components/MathText';
import SEO from '../../components/common/SEO';

const QuestionDetail = () => {
    const { questionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newAnswer, setNewAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showEditor, setShowEditor] = useState(false);

    const fetchQuestion = async () => {
        try {
            const response = await axios.get(`/forum/${questionId}`);
            setQuestion(response.data);
        } catch (error) {
            console.error("Error fetching question", error);
            toast.error("فشل تحميل السؤال");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestion();
    }, [questionId]);

    const handleVote = async (type, id, value) => {
        const endpoint = type === 'question' ? `/forum/${id}/vote` : `/forum/answers/${id}/vote`;
        try {
            await axios.post(endpoint, { value });
            fetchQuestion();
            toast.success("تم التصويت بنجاح");
        } catch (error) {
            toast.error("فشل التصويت");
        }
    };

    const handleMarkSolved = async (answerId) => {
        try {
            await axios.post(`/forum/answers/${answerId}/accept`);
            fetchQuestion();
            toast.success("تم تحديد الإجابة الصحيحة");
        } catch (error) {
            toast.error("فشل العملية");
        }
    };

    const insertFormula = (latex, cursorOffset) => {
        const el = document.getElementById('answer-content');
        if (el) {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const wrappedLatex = `$ ${latex} $`;
            const content = newAnswer.substring(0, start) + wrappedLatex + newAnswer.substring(end);
            setNewAnswer(content);
            setTimeout(() => {
                el.focus();
                const newPos = start + wrappedLatex.length + cursorOffset - 2;
                el.setSelectionRange(newPos, newPos);
            }, 0);
        }
    };

    const submitAnswer = async (e) => {
        e.preventDefault();
        if (!newAnswer.trim()) return;
        setSubmitting(true);
        try {
            await axios.post(`/forum/${questionId}/answers`, { content: newAnswer });
            setNewAnswer('');
            setShowEditor(false);
            fetchQuestion();
            toast.success("تم نشر إجابتك!");
        } catch (error) {
            toast.error("فشل نشر الإجابة");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse" dir="rtl">
            <div className={`h-10 w-32 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-xl mb-6`} />
            <div className={`h-64 ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-[2rem] border-2 ${isDark ? 'border-slate-700' : 'border-slate-100'} mb-8`} />
            <div className={`h-32 ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-[2rem] border-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />
        </div>
    );

    if (!question) return (
        <div className="container mx-auto px-4 py-16 text-center" dir="rtl">
            <div className={`w-20 h-20 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-400`}>
                <MessageSquare size={40} />
            </div>
            <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>السؤال غير موجود</h3>
            <Link to="/student/forum" className="text-sky-500 font-bold hover:underline">العودة للمنتدى</Link>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl" dir="rtl">
            <SEO title={question.title} description={question.content.substring(0, 160)} />

            <button
                onClick={() => navigate('/student/forum')}
                className={`flex items-center gap-2 ${isDark ? 'text-slate-400 hover:text-sky-400' : 'text-slate-500 hover:text-sky-600'} transition-colors mb-6 font-bold`}
            >
                <ArrowRight size={20} />
                <span>العودة للمنتدى</span>
            </button>

            {/* Question Section */}
            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'} rounded-[2rem] p-6 md:p-10 border-2 mb-10 overflow-hidden relative`}>
                {question.is_solved && (
                    <div className="absolute top-0 left-0 bg-emerald-500 text-white px-6 py-2 rounded-br-[2rem] font-black text-xs flex items-center gap-2">
                        <CheckCircle size={14} /> تم الحل
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Vote Column */}
                    <div className="flex md:flex-col items-center gap-3 order-2 md:order-1">
                        <button
                            onClick={() => handleVote('question', question.id, 1)}
                            className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-slate-900/50 hover:bg-slate-700 text-sky-400' : 'bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-600'}`}
                        >
                            <ThumbsUp size={24} className="stroke-[3]" />
                        </button>
                        <span className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{question.votes_count || 0}</span>
                        <button
                            onClick={() => handleVote('question', question.id, -1)}
                            className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-slate-900/50 hover:bg-slate-700 text-rose-400' : 'bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600'}`}
                        >
                            <ThumbsDown size={24} className="stroke-[3]" />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 order-1 md:order-2 min-w-0">
                        <h1 className={`text-2xl md:text-3xl font-black mb-6 leading-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            {question.title}
                        </h1>

                        <div className={`text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-8 whitespace-pre-wrap`}>
                            <MathText text={question.content} />
                        </div>

                        <div className={`flex items-center justify-between pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center text-xl font-black shadow-inner`}>
                                    {question.user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className={`font-black text-sm ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{question.user.name}</div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <Clock size={12} />
                                        <span>نشر {formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: arDZ })}</span>
                                    </div>
                                </div>
                            </div>
                            {question.user.is_admin && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black">
                                    <ShieldCheck size={12} /> مسؤول المنصة
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Answers List */}
            <div className="space-y-6 mb-12">
                <div className="flex items-center gap-3 mb-6 px-4">
                    <MessageSquare size={24} className="text-sky-500" />
                    <h3 className={`text-xl font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {question.answers_count} إجابات
                    </h3>
                </div>

                {question.answers.map((answer) => (
                    <div
                        key={answer.id}
                        className={`rounded-[2.5rem] p-6 md:p-8 border-2 transition-all relative ${answer.is_accepted
                                ? (isDark ? 'bg-emerald-900/10 border-emerald-500/50 shadow-emerald-500/5' : 'bg-emerald-50/50 border-emerald-200 shadow-xl shadow-emerald-500/10')
                                : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/50')
                            }`}
                    >
                        {answer.is_accepted && (
                            <div className="absolute top-6 left-6 text-emerald-500 drop-shadow-sm animate-bounce-slow">
                                <CheckCircle size={32} fill="currentColor" className="text-emerald-100 dark:text-emerald-900/50" />
                            </div>
                        )}

                        <div className="flex gap-6">
                            {/* Answer Vote */}
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    onClick={() => handleVote('answer', answer.id, 1)}
                                    className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-700 text-slate-500 hover:text-sky-400' : 'hover:bg-slate-50 text-slate-400 hover:text-sky-600'}`}
                                >
                                    <ThumbsUp size={18} className="stroke-[3]" />
                                </button>
                                <span className={`font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{answer.votes_count || 0}</span>
                                <button
                                    onClick={() => handleVote('answer', answer.id, -1)}
                                    className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-700 text-slate-500 hover:text-rose-400' : 'hover:bg-slate-50 text-slate-400 hover:text-rose-600'}`}
                                >
                                    <ThumbsDown size={18} className="stroke-[3]" />
                                </button>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className={`text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-6 whitespace-pre-wrap`}>
                                    <MathText text={answer.content} />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center text-sm font-black`}>
                                            {answer.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{answer.user.name}</span>
                                            <span className="mx-2 text-slate-400 text-xs font-bold">•</span>
                                            <span className="text-[10px] font-bold text-slate-400">{formatDistanceToNow(new Date(answer.created_at), { addSuffix: true, locale: arDZ })}</span>
                                        </div>
                                    </div>

                                    {/* Mark as Solved (Owner only) */}
                                    {user && user.id === question.user_id && !question.is_solved && (
                                        <button
                                            onClick={() => handleMarkSolved(answer.id)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            <CheckCircle size={14} /> تحديد كإجابة صحيحة
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Answer Input Section */}
            {!question.is_locked ? (
                <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'} rounded-[2.5rem] p-8 border-2`}>
                    <div className="flex justify-between items-center mb-6">
                        <h4 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>أضف إجابتك</h4>
                        <button
                            type="button"
                            onClick={() => setShowEditor(!showEditor)}
                            className={`text-xs font-black px-4 py-2 rounded-xl border-2 transition-all ${showEditor
                                ? 'bg-sky-500 border-sky-500 text-white'
                                : `${isDark ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-sky-500' : 'bg-white border-slate-200 text-slate-500 hover:border-sky-500'}`
                                }`}
                        >
                            {showEditor ? 'إغلاق المحرر' : '➕ إدراج معادلة رياضية'}
                        </button>
                    </div>

                    <EquationEditor active={showEditor} onInsert={insertFormula} />

                    <form onSubmit={submitAnswer}>
                        <textarea
                            id="answer-content"
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            placeholder="اكتب إجابتك هنا... استخدم كود $ LaTeX $ للمعادلات"
                            className={`w-full h-40 p-5 rounded-[1.5rem] ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} border-2 focus:outline-none focus:border-sky-500 transition-all resize-none mb-6 font-bold`}
                        ></textarea>

                        {newAnswer && (
                            <div className={`p-6 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-[1.5rem] border-2 border-dashed mb-6`}>
                                <p className={`text-[10px] font-black uppercase mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>معاينة الإجابة:</p>
                                <div className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                                    <MathText text={newAnswer} />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={submitting || !newAnswer.trim()}
                                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-2xl transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-black group"
                            >
                                <Send size={20} className="group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform" />
                                <span>{submitting ? 'جاري النشر...' : 'نشر الإجابة الآن'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-100 border-slate-200'} rounded-[2.5rem] p-10 border-2 border-dashed text-center`}>
                    <Lock size={40} className="mx-auto text-slate-400 mb-4" />
                    <p className={`font-black ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>هذا النقاش مغلق من قبل المشرفين.</p>
                </div>
            )}
        </div>
    );
};

export default QuestionDetail;
