import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import SEO from '../components/common/SEO';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user.is_admin) {
                navigate('/admin');
            } else {
                navigate('/student');
            }
        } catch (e) {
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <SEO
                title="تسجيل الدخول"
                description="قم بتسجيل الدخول إلى منصة النجاح للوصول إلى دروس الرياضيات التفاعلية للسنة الرابعة متوسط."
                keywords="تسجيل الدخول, منصة النجاح, رياضيات, 4AM, الجزائر"
            />
            {loading && <LoadingScreen message="جاري التحقق من البيانات..." />}
            <div className="text-center mb-8">
                <div className="inline-block p-3 rounded-2xl bg-sky-100 text-sky-600 mb-4 shadow-sm">
                    <span className="font-bold text-xl">👋 أهلاً بك!</span>
                </div>
                <h1 className={`text-4xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'} mb-2 font-cairo`}>العودة للدراسة</h1>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium tracking-tight`}>جاهز لتعلم شيء جديد اليوم؟</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error === 'Invalid credentials' ? 'خطأ في البريد الإلكتروني أو كلمة المرور' : error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} mr-1`}>البريد الإلكتروني</label>
                    <div className="relative group">
                        <Mail className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pr-12 pl-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-0 transition-all font-medium text-left"
                            placeholder="name@school.dz"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} mr-1`}>كلمة المرور</label>
                    <div className="relative group">
                        <Lock className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pr-12 pl-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-0 transition-all font-medium text-left"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-sky-500/30 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>تسجيل الدخول <ArrowRight size={20} className="rotate-180" /></>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 text-center">
                <p className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>هل أنت ولي أمر؟</p>
                <Link
                    to="/parent"
                    className="inline-flex items-center gap-2 text-sky-500 font-bold hover:text-sky-600 transition-colors"
                >
                    دخول فضاء الأولياء <ArrowRight size={16} className="rotate-180" />
                </Link>
            </div>
        </div>
    );
}
