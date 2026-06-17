import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowRight, HelpCircle } from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';
import EquationEditor from '../../components/EquationEditor';
import MathText from '../../components/MathText';
import { useTheme } from '../../context/ThemeContext';
import SEO from '../../components/common/SEO';

const ForumCreate = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const insertFormula = (latex, cursorOffset) => {
        const el = document.getElementById('forum-content');
        if (el) {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const wrappedLatex = `$ ${latex} $`;
            const newContent = content.substring(0, start) + wrappedLatex + content.substring(end);
            setContent(newContent);
            setTimeout(() => {
                el.focus();
                const newPos = start + wrappedLatex.length + cursorOffset - 2;
                el.setSelectionRange(newPos, newPos);
            }, 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error('يرجى ملء جميع الحقول');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post('/forum', { title, content });
            toast.success('تم نشر سؤالك بنجاح!');
            navigate(`/student/forum/${response.data.id}`);
        } catch (error) {
            toast.error('فشل نشر السؤال');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl" dir="rtl">
            <SEO
                title="طرح سؤال جديد"
                description="اطرح سؤالك في منتدى النقاش وساعد الآخرين في فهم الرياضيات."
            />
            <button
                onClick={() => navigate(-1)}
                className={`flex items-center gap-2 ${isDark ? 'text-slate-400 hover:text-sky-400' : 'text-slate-500 hover:text-sky-600'} transition-colors mb-6 font-bold`}
            >
                <ArrowRight size={20} />
                <span>العودة للمنتدى</span>
            </button>

            <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-[2rem] p-8 shadow-xl border-2`}>
                <div className="flex items-center gap-3 mb-8">
                    <div className={`w-12 h-12 ${isDark ? 'bg-sky-900/30' : 'bg-sky-50'} rounded-2xl flex items-center justify-center text-sky-500`}>
                        <HelpCircle size={28} />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>طرح سؤال جديد</h1>
                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium text-sm`}>اشرح سؤالك بوضوح ليتمكن الآخرون من مساعدتك</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={`block text-sm font-black ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>عنوان السؤال</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: كيف أحسب المسافة بين نقطتين في المعلم؟"
                            className={`w-full px-5 py-4 rounded-2xl ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} border-2 focus:outline-none focus:border-sky-500 transition-all font-bold`}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className={`block text-sm font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>تفاصيل السؤال</label>
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

                        <textarea
                            id="forum-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="اكتب تفاصيل سؤالك هنا... يمكنك استخدام كود $ LaTeX $ للمعادلات"
                            className={`w-full h-48 px-5 py-4 rounded-2xl ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} border-2 focus:outline-none focus:border-sky-500 transition-all resize-none font-bold mb-4`}
                        ></textarea>

                        {content && (
                            <div className={`p-5 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-2xl border-2 border-dashed`}>
                                <p className={`text-[10px] font-black uppercase mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>معاينة مباشرة:</p>
                                <div className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                                    <MathText text={content} />
                                </div>
                            </div>
                        )}
                        <p className={`mt-3 text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>💡 نصيحة: كن دقيقاً في طرح سؤالك وارفق المعطيات اللازمة.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 hover:-translate-y-1 active:translate-y-0"
                        >
                            <Send size={20} />
                            <span>{submitting ? 'جاري النشر...' : 'نشر السؤال في المنتدى'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForumCreate;
