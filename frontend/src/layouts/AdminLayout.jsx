import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, BookOpen, Users, LogOut, Menu, X, Moon, Sun, Trophy, Shield, MessageSquare, ShoppingBag, BarChart3, Megaphone, Database, Radio, Settings, Zap, ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import clsx from 'clsx';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
    const { logout, user } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'لوحة القيادة' },
        { path: '/admin/content', icon: BookOpen, label: 'إدارة المحتوى' },
        { path: '/admin/students', icon: Users, label: 'إدارة الطلاب' },
        { path: '/admin/tournaments', icon: Trophy, label: 'إدارة المسابقات' },
        { path: '/admin/live-session', icon: Radio, label: 'غرفة التحكم المباشرة' },
        { path: '/admin/security', icon: Shield, label: 'مراقب الأمان' },
        { path: '/admin/forum', icon: MessageSquare, label: 'إدارة المنتدى' },
        { path: '/admin/store', icon: ShoppingBag, label: 'إدارة المتجر' },
        { path: '/admin/analytics-deep', icon: BarChart3, label: 'التحليلات البيداغوجية' },
        { path: '/admin/broadcast', icon: Megaphone, label: 'البث العالمي' },
        { path: '/admin/backups', icon: Database, label: 'النسخ الاحتياطي' },
        { path: '/admin/settings', icon: Settings, label: 'إعدادات الوصول والحوكمة' },
    ];

    const SidebarContent = ({ onClose }) => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={clsx("p-5 flex items-center gap-4 border-b", isDark ? "border-slate-700" : "border-slate-100")}>
                <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 rotate-3">
                    <Zap className="text-white w-6 h-6" />
                </div>
                {isSidebarOpen && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col overflow-hidden">
                        <span className="font-black text-lg tracking-tight text-indigo-600 whitespace-nowrap">لوحة الإدارة</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MATH PLATFORM</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            title={!isSidebarOpen ? item.label : undefined}
                            className={clsx(
                                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative",
                                active
                                    ? (isDark ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-700 shadow-sm")
                                    : (isDark ? "text-slate-400 hover:bg-slate-700/60 hover:text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                            )}
                        >
                            <Icon className={clsx(
                                "w-5 h-5 shrink-0 transition-all",
                                active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
                            )} />
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-bold text-sm truncate"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                            {active && (
                                <motion.div
                                    layoutId="activeIndAdmin"
                                    className="absolute right-0 w-1 h-7 bg-indigo-600 rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className={clsx("p-4 border-t space-y-2", isDark ? "border-slate-700" : "border-slate-100")}>
                {isSidebarOpen && (
                    <div className="flex items-center gap-2 justify-center mb-3">
                        <LanguageSwitcher />
                        <button
                            onClick={toggleTheme}
                            className={clsx(
                                "p-2 rounded-xl border transition-all",
                                isDark ? "bg-slate-700 border-slate-600 text-amber-400 hover:bg-slate-600" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    title={!isSidebarOpen ? "تسجيل الخروج" : undefined}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {isSidebarOpen && <span>تسجيل الخروج</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className={clsx("flex min-h-screen", isDark ? "bg-slate-900 text-slate-200" : "bg-slate-100")} dir="rtl">

            {/* == DESKTOP SIDEBAR == */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 88 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={clsx(
                    "hidden lg:flex flex-col sticky top-0 h-screen shrink-0 border-l overflow-hidden relative",
                    isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-lg shadow-slate-200/50"
                )}
            >
                <SidebarContent onClose={() => {}} />

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={clsx(
                        "absolute -left-4 top-20 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg z-50 transition-all",
                        isDark
                            ? "bg-slate-800 border-slate-600 text-slate-400 hover:text-indigo-400 hover:border-indigo-500"
                            : "bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300"
                    )}
                >
                    <ChevronLeft className={clsx("w-4 h-4 transition-transform duration-300", isSidebarOpen ? "" : "rotate-180")} />
                </button>
            </motion.aside>

            {/* == MOBILE OVERLAY + DRAWER == */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={clsx(
                                "fixed top-0 right-0 bottom-0 w-72 z-50 lg:hidden",
                                isDark ? "bg-slate-800" : "bg-white"
                            )}
                        >
                            <SidebarContent onClose={() => setMobileOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* == MAIN AREA == */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Top Bar */}
                <header className={clsx(
                    "lg:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b backdrop-blur-md",
                    isDark ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-slate-200"
                )}>
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <Zap className="text-white w-5 h-5" />
                        </div>
                        <span className="font-black text-lg text-indigo-600">لوحة الإدارة</span>
                    </div>
                    <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

