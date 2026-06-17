import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Award, Coins, LogOut, MessageSquare, Moon, PenTool, Lock, ShoppingBag, Sun, Trophy, Zap, ChevronDown, Globe, User, Settings } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import DailyReward from '../components/DailyReward';
import SearchBar from '../components/SearchBar';
import PomodoroTimer from '../components/PomodoroTimer';
import api from '../api/axios';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentLayout() {
    const { logout, user } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { t } = useTranslation();
    const [features, setFeatures] = React.useState([]);
    const [profileOpen, setProfileOpen] = React.useState(false);
    const navigate = useNavigate();
    const profileRef = useRef(null);

    React.useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const { data } = await api.get('/settings/features');
                setFeatures(data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchFeatures();
    }, []);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isLocked = (name) => {
        const f = features.find(feat => feat.name === name);
        return f && !f.is_unlocked;
    };

    const isPremium = (name) => {
        const f = features.find(feat => feat.name === name);
        return f && f.access_type === 'premium';
    };

    const handleLogout = async () => {
        setProfileOpen(false);
        await logout();
        navigate('/login');
    };

    const equippedAvatar = user?.inventory?.find(i => i.is_equipped && i.item?.type === 'avatar')?.item?.image_url || '👤';

    return (
        <div className={`min-h-screen pb-20 ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-50'}`}>
            {/* Daily Reward Modal */}
            <DailyReward />

            {/* Topbar */}
            <header className={`${isDark ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} sticky top-0 z-50`}>
                <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/student" className="flex items-center gap-2 md:gap-3 group shrink-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-sky-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform rotate-3 group-hover:rotate-6">
                            ن
                        </div>
                        <span className={`text-lg md:text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            منصة <span className="text-sky-500">النجاح</span> <span className="hidden xs:inline">4AM</span>
                        </span>
                    </Link>

                    {/* Global Search Bar */}
                    <div className="hidden md:block flex-1 max-w-sm mx-4">
                        <SearchBar />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-6 mr-8 shrink-0">
                        <Link to="/student" className={`font-bold hover:text-sky-500 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'} flex items-center gap-1.5`}>
                            <Award size={16} className="text-sky-500" /> الدروس
                        </Link>
                        <Link to="/student/store" className={`font-bold hover:text-sky-500 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'} flex items-center gap-1.5 relative`}>
                            <ShoppingBag size={16} className="text-sky-500" /> {t('common.store')}
                            {isLocked('store') && <Lock size={10} className="text-rose-400 absolute -top-1 -right-2" />}
                        </Link>
                        <Link to="/student/forum" className={`font-bold hover:text-sky-500 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'} flex items-center gap-1.5`}>
                            <MessageSquare size={16} className="text-sky-500" /> {t('common.forum')}
                        </Link>
                        <Link to="/student/tournaments" className={`font-bold hover:text-sky-500 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'} flex items-center gap-1.5 relative`}>
                            <Trophy size={16} className="text-sky-500" /> {t('common.tournaments')}
                            {isLocked('arena') && <Lock size={10} className="text-amber-500 absolute -top-1 -right-2" />}
                        </Link>
                        <Link to="/student/arcade" className={`font-bold hover:text-sky-500 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'} flex items-center gap-1.5 relative`}>
                            <Zap size={16} className="text-sky-500" /> {t('student.battle_challenge')}
                            {isPremium('arcade') && !isLocked('arcade') && <Zap size={8} className="text-amber-500 fill-amber-500 absolute -top-1 -right-2" />}
                            {isLocked('arcade') && <Lock size={10} className="text-rose-400 absolute -top-1 -right-2" />}
                        </Link>
                    </nav>

                    {/* Right Section: Compact */}
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        {/* Coins display */}
                        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100'} border-2 rounded-full text-amber-500 text-xs font-black`}>
                            <Coins size={14} className="text-amber-500 fill-amber-500" />
                            <span>{user?.coins || 0}</span>
                        </div>

                        {/* Notifications */}
                        <NotificationBell />

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-2xl transition-all ${profileOpen
                                        ? (isDark ? 'bg-slate-700 ring-2 ring-sky-500/30' : 'bg-slate-100 ring-2 ring-sky-500/20')
                                        : (isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50')
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-inner ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                    {equippedAvatar}
                                </div>
                                <ChevronDown size={14} className={`hidden md:block transition-transform ${profileOpen ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                            </button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className={`absolute left-0 md:right-0 md:left-auto top-full mt-2 w-72 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-2 rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden z-50`}
                                    >
                                        {/* User Info Header */}
                                        <div className={`p-5 ${isDark ? 'bg-slate-700/40' : 'bg-slate-50'} border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                                                    {equippedAvatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`font-black text-sm truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{user?.name}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isDark ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-50 text-sky-600'}`}>
                                                            المستوى {user?.level || 1}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Points & Coins Bar */}
                                            <div className="flex gap-3 mt-4">
                                                <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black ${isDark ? 'bg-slate-800 text-sky-400' : 'bg-white text-sky-600 shadow-sm'}`}>
                                                    <Award size={14} className="fill-sky-500" />
                                                    {user?.points || 0} نقطة
                                                </div>
                                                <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-white text-amber-600 shadow-sm'}`}>
                                                    <Coins size={14} className="fill-amber-500" />
                                                    {user?.coins || 0} عملة
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="p-2">
                                            <Link
                                                to="/student/sketchpad"
                                                onClick={() => setProfileOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <PenTool size={18} className="text-sky-500" /> لوحة الرسم
                                            </Link>
                                            <Link
                                                to="/student/certificates"
                                                onClick={() => setProfileOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <Award size={18} className="text-emerald-500" /> شهاداتي
                                            </Link>

                                            {/* Divider */}
                                            <div className={`my-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />

                                            {/* Theme Toggle */}
                                            <button
                                                onClick={toggleTheme}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-400" />}
                                                    {isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
                                                </div>
                                                <div className={`w-10 h-5 rounded-full transition-all flex items-center ${isDark ? 'bg-sky-500 justify-end' : 'bg-slate-200 justify-start'}`}>
                                                    <div className="w-4 h-4 bg-white rounded-full mx-0.5 shadow-sm" />
                                                </div>
                                            </button>

                                            {/* Language */}
                                            <div className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                <div className="flex items-center gap-3">
                                                    <Globe size={18} className="text-indigo-500" /> اللغة
                                                </div>
                                                <LanguageSwitcher />
                                            </div>

                                            {/* Divider */}
                                            <div className={`my-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />

                                            {/* Logout */}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                            >
                                                <LogOut size={18} /> تسجيل الخروج
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
                <Outlet />
            </main>

            {/* Bottom Menu for Mobile */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4">
                <div className={`flex items-center justify-around p-3 ${isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'} backdrop-blur-md border-2 rounded-3xl shadow-2xl`}>
                    <Link to="/student" className="p-2 text-sky-500"><Award size={24} /></Link>
                    <Link to="/student/store" className="p-2 text-slate-400 hover:text-sky-500 relative">
                        <ShoppingBag size={24} />
                        {isLocked('store') && <Lock size={10} className="text-rose-400 absolute top-1 right-1" />}
                    </Link>
                    <Link to="/student/forum" className="p-2 text-slate-400 hover:text-sky-500"><MessageSquare size={24} /></Link>
                    <Link to="/student" className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/30 -mt-10 border-4 border-white dark:border-slate-800"><div className="font-bold">ن</div></Link>
                    <Link to="/student/tournaments" className="p-2 text-slate-400 hover:text-sky-500 relative">
                        <Trophy size={24} />
                        {isLocked('arena') && <Lock size={10} className="text-amber-500 absolute top-1 right-1" />}
                    </Link>
                    <NotificationBell />
                </div>
            </div>
            {/* Floating Pomodoro Timer */}
            <PomodoroTimer />

            {/* Footer with Privacy Policy */}
            <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm pb-24 relative z-40 mt-16 flex justify-center">
                <div className="max-w-xl mx-auto px-4 py-8 flex flex-col items-center gap-4 text-center">
                    <span className="text-sm font-bold text-slate-400">© 2026 منصة النجاح 4AM. جميع الحقوق محفوظة.</span>
                    <Link to="/privacy" className="text-sm font-bold text-slate-500 hover:text-sky-500 transition-colors flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <Lock size={14} /> سياسة الخصوصية والتأمين
                    </Link>
                </div>
            </footer>
        </div>
    );
}
