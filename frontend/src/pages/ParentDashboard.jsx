import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
    User, BookOpen, Trophy, TrendingUp, Calendar, ArrowLeft,
    BarChart3, CheckCircle2, Clock, Star, Moon, Sun, LogOut
} from 'lucide-react';
import api from '../api/axios';

export default function ParentDashboard() {
    const [step, setStep] = useState('login'); // login | dashboard
    const [parentPhone, setParentPhone] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const { isDark, toggleTheme } = useTheme();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data: res } = await api.post('/parent/login', {
                parent_phone: parentPhone,
                student_email: studentEmail,
            });
            localStorage.setItem('parent_token', res.access_token);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.access_token}`;
            await fetchDashboard();
            setStep('dashboard');
        } catch (e) {
            setError('رقم الهاتف أو البريد الإلكتروني غير صحيح');
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboard = async () => {
        const { data: res } = await api.get('/parent/dashboard');
        setData(res);
    };

    const handleLogout = () => {
        localStorage.removeItem('parent_token');
        delete api.defaults.headers.common['Authorization'];
        setStep('login');
        setData(null);
    };

    // Check for existing parent token on mount
    useEffect(() => {
        const token = localStorage.getItem('parent_token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchDashboard()
                .then(() => setStep('dashboard'))
                .catch(() => {
                    localStorage.removeItem('parent_token');
                    delete api.defaults.headers.common['Authorization'];
                });
        }
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return isDark ? 'bg-emerald-900/20' : 'bg-emerald-50';
        if (score >= 60) return isDark ? 'bg-amber-900/20' : 'bg-amber-50';
        return isDark ? 'bg-rose-900/20' : 'bg-rose-50';
    };

    if (step === 'login') {
        return (
            <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`fixed top-4 left-4 z-50 p-3 rounded-2xl shadow-lg transition-all ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-white/80 text-slate-500'}`}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full max-w-md ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-2 rounded-3xl p-8 shadow-2xl`}
                >
                    <div className="text-center mb-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl mb-4 ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                            <User size={20} />
                            <span className="font-bold">فضاء الأولياء</span>
                        </div>
                        <h1 className={`text-3xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            متابعة التقدم
                        </h1>
                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                            تابع تقدم ابنك في منصة النجاح
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className={`text-sm font-bold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                📱 رقم هاتف الولي
                            </label>
                            <input
                                type="tel"
                                value={parentPhone}
                                onChange={(e) => setParentPhone(e.target.value)}
                                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'} border-2 rounded-2xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-all font-medium text-left`}
                                placeholder="0X XX XX XX XX"
                                required
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className={`text-sm font-bold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                📧 البريد الإلكتروني للتلميذ
                            </label>
                            <input
                                type="email"
                                value={studentEmail}
                                onChange={(e) => setStudentEmail(e.target.value)}
                                className={`w-full ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'} border-2 rounded-2xl py-3 px-4 focus:outline-none focus:border-emerald-500 transition-all font-medium text-left`}
                                placeholder="student@email.com"
                                required
                                dir="ltr"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/30 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>الدخول <ArrowLeft size={20} /></>
                            )}
                        </button>
                    </form>

                    <p className={`text-center text-xs mt-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        أدخل رقم هاتف الولي المسجل وبريد التلميذ للوصول
                    </p>
                </motion.div>
            </div>
        );
    }

    // Dashboard View
    if (!data) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : ''}`}>
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { student, summary, recent_scores, field_mastery } = data;

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-emerald-50/50 to-teal-50/50'} pb-10`}>
            {/* Header */}
            <header className={`${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'} backdrop-blur-md border-b sticky top-0 z-50`}>
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white">
                            <User size={20} />
                        </div>
                        <div>
                            <span className={`font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>فضاء الأولياء</span>
                            <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{student.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleTheme} className={`p-2 rounded-xl ${isDark ? 'text-amber-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}>
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button onClick={handleLogout} className={`p-2 rounded-xl ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'} hover:text-rose-500`}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Student Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${isDark ? 'bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-emerald-800' : 'bg-gradient-to-r from-emerald-500 to-teal-600'} rounded-3xl p-6 text-white relative overflow-hidden`}
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-1">{student.name}</h2>
                        <p className="text-emerald-100/80 font-bold text-sm">{student.school || 'غير محدد'} • السنة 4 متوسط</p>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5">
                                <Trophy size={16} />
                                <span className="font-bold text-sm">{student.points} نقطة</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5">
                                <Star size={16} />
                                <span className="font-bold text-sm">المستوى {student.level}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5">
                                <TrendingUp size={16} />
                                <span className="font-bold text-sm">{student.xp} XP</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'الدروس المكتملة', value: `${summary.completed_lessons}/${summary.total_lessons}`, icon: BookOpen, color: 'sky' },
                        { label: 'نسبة الإكمال', value: `${summary.completion_rate}%`, icon: CheckCircle2, color: 'emerald' },
                        { label: 'نشاط الأسبوع', value: summary.weekly_activity, icon: Calendar, color: 'violet' },
                        { label: 'النقاط', value: student.points, icon: Trophy, color: 'amber' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border-2 rounded-2xl p-4 text-center`}
                        >
                            <stat.icon size={24} className={`mx-auto mb-2 text-${stat.color}-500`} />
                            <p className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{stat.value}</p>
                            <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border-2 rounded-2xl p-6`}
                >
                    <h3 className={`font-black text-lg mb-4 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        📊 التقدم العام
                    </h3>
                    <div className={`w-full h-5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${summary.completion_rate}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full relative"
                        >
                            <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-black">
                                {summary.completion_rate}%
                            </span>
                        </motion.div>
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Field Mastery */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border-2 rounded-2xl p-6`}
                    >
                        <h3 className={`font-black text-lg mb-4 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            📈 الإتقان حسب المجال
                        </h3>
                        <div className="space-y-3">
                            {field_mastery && field_mastery.length > 0 ? field_mastery.map((field, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-1">
                                        <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{field.field_name}</span>
                                        <span className={`text-sm font-black ${getScoreColor(field.avg_score)}`}>{Math.round(field.avg_score)}%</span>
                                    </div>
                                    <div className={`w-full h-2.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${field.avg_score >= 80 ? 'bg-emerald-500' :
                                                field.avg_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                                }`}
                                            style={{ width: `${Math.min(100, field.avg_score)}%` }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>لا توجد بيانات بعد</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Scores */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border-2 rounded-2xl p-6`}
                    >
                        <h3 className={`font-black text-lg mb-4 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            📝 آخر النتائج
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {recent_scores && recent_scores.length > 0 ? recent_scores.map((score, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between p-3 rounded-xl ${getScoreBg(score.score)}`}
                                >
                                    <div>
                                        <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{score.lesson}</p>
                                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{score.date}</p>
                                    </div>
                                    <div className={`font-black text-lg ${getScoreColor(score.score)}`}>
                                        {score.score != null ? `${score.score}%` : '—'}
                                    </div>
                                </div>
                            )) : (
                                <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>لا توجد نتائج بعد</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Footer Note */}
                <div className={`text-center text-xs font-bold py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    🔒 هذه الصفحة للعرض فقط — لا يمكن تعديل البيانات
                </div>
            </main>
        </div>
    );
}
