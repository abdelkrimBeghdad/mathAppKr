import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trophy, BookOpen, Swords, Info, X } from 'lucide-react';
import api from '../api/axios';
import SafeLink from './common/SafeLink';

const typeConfig = {
    achievement: { icon: '🏆', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    challenge: { icon: '⚔️', color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    lesson: { icon: '📚', color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
    system: { icon: '🔔', color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    quiz: { icon: '✅', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isDark } = useTheme();
    const panelRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/notifications');
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error('Failed to mark notification as read', e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error('Failed to mark all as read', e);
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'الآن';
        if (mins < 60) return `منذ ${mins} دقيقة`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;
        const days = Math.floor(hours / 24);
        return `منذ ${days} يوم`;
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
                className={`relative p-2 md:p-2.5 rounded-xl transition-all ${isDark
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-500 hover:bg-slate-100'
                    }`}
                title="الإشعارات"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute left-0 md:left-auto md:right-0 top-full mt-2 w-[340px] md:w-96 rounded-2xl border-2 shadow-2xl z-[100] overflow-hidden ${isDark
                            ? 'bg-slate-800 border-slate-700 shadow-slate-900'
                            : 'bg-white border-slate-200 shadow-slate-200/50'
                            }`}
                    >
                        {/* Header */}
                        <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <h3 className={`font-black text-lg ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                🔔 الإشعارات
                            </h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors flex items-center gap-1"
                                    >
                                        <CheckCheck size={14} />
                                        قراءة الكل
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                                    <X size={16} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                                    <p className={`font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>لا توجد إشعارات</p>
                                </div>
                            ) : (
                                notifications.map((notif) => {
                                    const config = typeConfig[notif.type] || typeConfig.system;
                                    const content = (
                                        <div className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors border-b last:border-0 ${isDark ? 'border-slate-700/50' : 'border-slate-50'
                                            } ${!notif.is_read
                                                ? isDark ? 'bg-sky-900/10' : 'bg-sky-50/50'
                                                : isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                                            }`}
                                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${isDark ? config.bg.replace('dark:', '') : config.bg.split(' ')[0]
                                                }`}>
                                                {notif.icon || config.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-bold text-sm truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <span className="w-2 h-2 bg-sky-500 rounded-full shrink-0" />
                                                    )}
                                                </div>
                                                <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {notif.message}
                                                </p>
                                                <p className={`text-[10px] mt-1 font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {timeAgo(notif.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    );

                                    if (notif.action_url) {
                                        return (
                                            <SafeLink key={notif.id} href={notif.action_url} className="block no-underline">
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                >
                                                    {content}
                                                </motion.div>
                                            </SafeLink>
                                        );
                                    }

                                    return (
                                        <motion.div
                                            key={notif.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            {content}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
