import { Navigate, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Shield } from 'lucide-react';

export default function GuestLayout() {
    const { isDark, toggleTheme } = useTheme();
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'} border-t-transparent`}>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
            </div>
        );
    }

    // Redirect authenticated users away from the login page
    if (user) {
        return <Navigate to={user.is_admin ? '/admin' : '/student'} replace />;
    }

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDark ? 'bg-slate-900' : ''}`}>
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className={`fixed top-4 left-4 z-50 p-3 rounded-2xl shadow-lg transition-all ${isDark ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-white/80 backdrop-blur text-slate-500 hover:text-slate-700'}`}
                title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Animated Background Blobs */}
            <div className={`absolute top-0 -left-4 w-72 h-72 ${isDark ? 'bg-sky-600' : 'bg-sky-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob`}></div>
            <div className={`absolute top-0 -right-4 w-72 h-72 ${isDark ? 'bg-rose-600' : 'bg-rose-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000`}></div>
            <div className={`absolute -bottom-8 left-20 w-72 h-72 ${isDark ? 'bg-amber-600' : 'bg-amber-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000`}></div>

            <div className={`w-full max-w-md ${isDark ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-xl border ${isDark ? 'border-slate-700/40' : 'border-white/40'} rounded-[2rem] p-2 shadow-2xl ${isDark ? 'shadow-slate-900' : 'shadow-sky-100'} relative z-10`}>
                <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white/80'} rounded-[1.5rem] overflow-hidden`}>
                    <Outlet />
                </div>
            </div>

            {/* Guest Footer Links */}
            <div className="fixed bottom-4 text-center z-50 w-full flex justify-center">
                <a href="/privacy" className={`text-xs font-bold transition-all px-4 py-2 rounded-full backdrop-blur-sm shadow flex items-center gap-1.5 ${isDark ? 'bg-slate-800/80 text-slate-300 hover:text-white' : 'bg-white/80 text-slate-500 hover:text-slate-800'}`}>
                    <Shield size={12} /> سياسة الخصوصية
                </a>
            </div>
        </div>
    );
}

