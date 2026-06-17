import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { BookOpen, Lock, CheckCircle, Award, Trophy, Star, Zap, TrendingUp, ArrowLeftRight, Home, Map, Swords, User, ChevronLeft, Settings, Beaker, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import BattleWidget from '../../components/BattleWidget';
import WorldMap from '../../components/WorldMap';
import PersonalizedPath from '../../components/PersonalizedPath';
import PersonalGoalsWidget from '../../components/PersonalGoalsWidget';
import DailyQuestsWidget from '../../components/DailyQuestsWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonDashboard } from '../../components/SkeletonLoader';
import clsx from 'clsx';
import {
    Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import SEO from '../../components/common/SEO';

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [viewMode, setViewMode] = useState('map'); // Default to map for the 'wow' factor
    const [activeTab, setActiveTab] = useState('home'); // Tabs: home, path, arena, profile

    // --- Data Fetching with React Query ---
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['studentStats'],
        queryFn: async () => {
            const res = await api.get('/student/stats');
            return res.data;
        }
    });

    const { data: fields, isLoading: fieldsLoading } = useQuery({
        queryKey: ['studentStructure'],
        queryFn: async () => {
            const res = await api.get('/student/structure');
            return res.data;
        }
    });

    const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const res = await api.get('/leaderboard');
            return res.data;
        }
    });

    const { data: masteryData, isLoading: masteryLoading } = useQuery({
        queryKey: ['studentMastery'],
        queryFn: async () => {
            const res = await api.get('/student/mastery');
            return res.data;
        }
    });

    const loading = statsLoading || fieldsLoading || leaderboardLoading || masteryLoading;

    if (loading) return <SkeletonDashboard />;

    // -------------------------------------------------------------
    // HOME TAB: Clean, Action-Oriented
    // -------------------------------------------------------------
    const renderHome = () => (
        <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8" dir="rtl">

            {/* Primary Action Hero - Extremely Focused */}
            <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-sky-500/20 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Decorative Math SVG Patterns */}
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
                    <svg className="absolute top-4 right-8 w-20 h-20" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="35" stroke="white" strokeWidth="2" strokeDasharray="8 6" />
                        <circle cx="40" cy="40" r="18" stroke="white" strokeWidth="1.5" />
                    </svg>
                    <svg className="absolute bottom-6 right-1/4 w-16 h-16" viewBox="0 0 60 60" fill="none">
                        <polygon points="30,5 55,50 5,50" stroke="white" strokeWidth="2" fill="none" />
                    </svg>
                    <svg className="absolute top-1/3 left-1/3 w-24 h-24" viewBox="0 0 100 100" fill="none">
                        <rect x="15" y="15" width="70" height="70" rx="15" stroke="white" strokeWidth="2" strokeDasharray="12 8" transform="rotate(15 50 50)" />
                    </svg>
                    <svg className="absolute bottom-4 left-8 w-14 h-14" viewBox="0 0 50 50" fill="none">
                        <path d="M10 25 Q25 5 40 25 Q25 45 10 25" stroke="white" strokeWidth="2" />
                    </svg>
                </div>
                {/* Floating Math Symbols */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <span className="absolute text-4xl text-white/[0.06] font-black top-3 left-[15%] animate-pulse">∑</span>
                    <span className="absolute text-5xl text-white/[0.06] font-black bottom-4 right-[20%]">π</span>
                    <span className="absolute text-3xl text-white/[0.06] font-black top-[40%] right-[10%] animate-pulse" style={{ animationDelay: '1s' }}>√</span>
                    <span className="absolute text-4xl text-white/[0.06] font-black bottom-2 left-[40%]">∞</span>
                    <span className="absolute text-3xl text-white/[0.06] font-black top-2 left-[60%] animate-pulse" style={{ animationDelay: '0.5s' }}>Δ</span>
                </div>
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
                <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-indigo-300/15 blur-[60px] rounded-full" />

                <div className="relative z-10 flex-1 space-y-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black mb-3">
                            مرحباً بك، {stats?.name || 'طالبي العزيز'} 👋
                        </h1>
                        <p className="text-sky-100 text-lg md:text-xl font-medium">
                            جاهز لمواصلة التألق؟ مسارك بانتظارك.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-3 bg-black/20 px-5 py-3 rounded-2xl backdrop-blur-sm">
                            <Star className="text-amber-400 fill-amber-400" size={24} />
                            <div>
                                <div className="text-[10px] text-sky-200 font-bold uppercase tracking-widest">المستوى</div>
                                <div className="text-xl font-black">{stats?.level || 1}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-black/20 px-5 py-3 rounded-2xl backdrop-blur-sm">
                            <Award className="text-emerald-400" size={24} />
                            <div>
                                <div className="text-[10px] text-sky-200 font-bold uppercase tracking-widest">النقاط</div>
                                <div className="text-xl font-black">{stats?.points || 0}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/20 px-5 py-3 rounded-2xl backdrop-blur-sm border border-white/20">
                            <Star className="text-amber-400 fill-amber-400" size={24} />
                            <div>
                                <div className="text-[10px] text-sky-200 font-bold uppercase tracking-widest">العملات</div>
                                <div className="text-xl font-black">{stats?.coins || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Circle & CTA */}
                <div className="relative z-10 bg-white/10 p-6 rounded-[2rem] backdrop-blur-md flex flex-col items-center justify-center min-w-[250px] border border-white/20">
                    <div className="text-sm font-bold text-sky-100 mb-4 text-center">التقدم للمستوى التالي</div>

                    <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/20" />
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                                className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                strokeDasharray={56 * 2 * Math.PI}
                                strokeDashoffset={stats ? (56 * 2 * Math.PI) - ((stats.xp / stats.xp_next_level) * (56 * 2 * Math.PI)) : 56 * 2 * Math.PI}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black" dir="ltr">{stats ? Math.round((stats.xp / stats.xp_next_level) * 100) : 0}%</span>
                            <span className="text-[10px] font-bold text-sky-200" dir="ltr">{stats ? `${stats.xp} / ${stats.xp_next_level} XP` : ''}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setActiveTab('path')}
                        className="w-full py-3 bg-white text-sky-600 hover:bg-sky-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                        أكمل التعلم <ChevronLeft size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Immediate tasks */}
                <div className="lg:col-span-2 space-y-8">
                    <DailyQuestsWidget />
                </div>

                {/* Right Column: Lab Shortcuts */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Zap className="text-amber-500 fill-amber-500" size={20} />
                        مختبرات مميزة
                    </h3>

                    <div
                        onClick={() => navigate('/student/labs/equations')}
                        className={`rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 cursor-pointer hover:-translate-y-1 transition-all group relative overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                    >
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                        <div className="flex items-start gap-4 mr-4">
                            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <ArrowLeftRight size={24} />
                            </div>
                            <div>
                                <h4 className={`font-bold text-lg mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>مختبر جملة معادلتين</h4>
                                <p className={`text-xs font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>اتقن طرق التعويض والجمع بخطوات عملية.</p>
                                <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded ${isDark ? 'text-indigo-400 bg-indigo-950/50' : 'text-indigo-600 bg-indigo-50'}`}>
                                    <span dir="ltr">x , y</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/student/labs/linear-function')}
                        className={`rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 cursor-pointer hover:-translate-y-1 transition-all group relative overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                    >
                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                        <div className="flex items-start gap-4 mr-4">
                            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h4 className={`font-bold text-lg mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>مختبر الدالة الخطية</h4>
                                <p className={`text-xs font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>استكشف التناسبية والتمثيل البياني.</p>
                                <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded ${isDark ? 'text-emerald-400 bg-emerald-950/50' : 'text-emerald-600 bg-emerald-50'}`}>
                                    <span dir="ltr">f(x) = ax</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Labs Academy: Gateway to Interactive World */}
            <div className="mt-12">
                <div 
                    onClick={() => navigate('/student/labs')}
                    className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white cursor-pointer group hover:shadow-2xl hover:shadow-indigo-500/30 transition-all border border-white/10"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-amber-400/20 transition-colors" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-lg">
                                <Beaker size={40} className="text-amber-300 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black mb-2">أكاديمية المختبرات التفاعلية</h3>
                                <p className="text-indigo-100 font-medium opacity-80 max-w-lg">استكشف أكثر من 40 مختبراً افتراضياً. جرب، فكك، وحطم المسائل الرياضية المعقدة بيدك!</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-lg group-hover:bg-amber-400 group-hover:text-indigo-900 transition-all shadow-xl">
                            <span>دخول الأكاديمية</span>
                            <ArrowLeft size={24} className="group-hover:translate-x-1 transition-transform rotate-180" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Trial: Mastery World Section */}
            <div className="mt-8">
                <div 
                    onClick={() => navigate('/student/mastery-world')}
                    className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border-2 border-amber-100 dark:border-amber-900/30 flex items-center justify-between group cursor-pointer hover:border-amber-400 transition-all shadow-sm"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-black text-slate-800 dark:text-white">عالم الإتقان (Mastery World)</h4>
                                <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">تجريبي</span>
                            </div>
                            <p className="text-slate-500 text-xs font-medium italic">جرب التعلم خطوة بخطوة: المفهوم الجديد للمختبرات.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 font-black text-sm group-hover:gap-4 transition-all uppercase tracking-widest">
                        <span>تجربة الآن</span>
                        <ArrowLeft size={16} className="rotate-180" />
                    </div>
                </div>
            </div>

            {/* Bottom: Recommendations take full width */}
            <div className="mt-12">
                <PersonalizedPath />
            </div>
        </motion.div>
    );

    // -------------------------------------------------------------
    // PATH TAB: The Learning Roadmap
    // -------------------------------------------------------------
    const renderPath = () => (
        <motion.div key="path" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className={`text-3xl font-black flex items-center gap-3 mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        <Map size={32} className="text-sky-500" />
                        رحلتك التعليمية
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">تنقل بين المحاور وابدأ دروسك بالترتيب الصحيح.</p>
                </div>

                <div className={`flex p-1 rounded-xl border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                    <button
                        onClick={() => setViewMode('map')}
                        className={clsx(
                            "px-5 py-2 rounded-lg text-sm font-black transition-all",
                            viewMode === 'map' ? (isDark ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" : "bg-white text-sky-600 shadow-sm") : (isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")
                        )}
                    >
                        الخريطة التفاعلية
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={clsx(
                            "px-5 py-2 rounded-lg text-sm font-black transition-all",
                            viewMode === 'list' ? (isDark ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" : "bg-white text-sky-600 shadow-sm") : (isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")
                        )}
                    >
                        قائمة المحاور
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'map' ? (
                    <motion.div key="map-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-slate-800 rounded-[2.5rem] p-4 shadow-2xl border-4 border-slate-700 overflow-hidden relative">
                            <WorldMap fields={fields} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="list-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16">
                        {fields.map((field, index) => (
                            <div key={field.id} className="relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-sky-500/20 rotate-3">
                                        <span dir="ltr">{index + 1}</span>
                                    </div>
                                    <h2 className={`text-3xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                        {field.name}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {field.sections?.map(section => (
                                        <div key={section.id} className={`rounded-3xl shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 border-2 overflow-hidden hover:border-sky-300 dark:hover:border-sky-500 transition-all duration-300 group flex flex-col ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                                <h3 className="font-black text-slate-800 text-lg group-hover:text-sky-600 transition-colors line-clamp-1">{section.name}</h3>
                                                {section.description && <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-2" dir="rtl">{section.description}</p>}
                                            </div>
                                            <div className="p-4 space-y-2 flex-1 bg-white">
                                                {section.lessons?.map(lesson => (
                                                    <div
                                                        key={lesson.id}
                                                        onClick={() => navigate(`/student/lessons/${lesson.id}`)}
                                                        className={clsx(
                                                            "flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border",
                                                            lesson.is_locked && lesson.status === 'locked' && lesson.access_type === 'classic' ? "opacity-50 grayscale" : "hover:bg-slate-50 border-transparent hover:border-slate-200"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={clsx(
                                                                "w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all",
                                                                lesson.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                                                    lesson.access_type === 'premium' && lesson.status === 'locked' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                                                                        lesson.status === 'unlocked' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'
                                                            )}>
                                                                {lesson.status === 'completed' ? <CheckCircle size={18} className="stroke-[3]" /> :
                                                                    lesson.access_type === 'premium' && lesson.status === 'locked' ? <Lock size={18} className="text-amber-600" /> :
                                                                        lesson.status === 'locked' && lesson.is_locked ? <Lock size={18} /> : <BookOpen size={18} />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={clsx(
                                                                    "font-bold text-sm line-clamp-1",
                                                                    lesson.status === 'locked' && lesson.is_locked && lesson.access_type === 'classic' ? 'text-slate-400' : 'text-slate-700'
                                                                )}>
                                                                    {lesson.name}
                                                                </span>
                                                                {lesson.access_type === 'premium' && lesson.status === 'locked' && (
                                                                    <span className="text-[10px] font-black text-amber-600 flex items-center gap-1">
                                                                        <Zap size={10} className="fill-amber-500" /> متميز ({lesson.price})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronLeft size={16} className="text-slate-300" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    // -------------------------------------------------------------
    // ARENA TAB: Battles & Leaderboard
    // -------------------------------------------------------------
    const renderArena = () => (
        <motion.div key="arena" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8" dir="rtl">
            <div className="mb-6">
                <h2 className={`text-3xl font-black flex items-center gap-3 mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    <Swords size={32} className="text-rose-500" />
                    ساحة المعارك والمنافسة
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">تغلب على أصدقائك واحتل صدارة الترتيب.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <BattleWidget />
                </div>

                <div className={`rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col h-[500px] ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-900 shadow-slate-200/50'}`}>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full" />

                    <div className="flex items-center justify-between mb-8 relative z-10 border-b border-slate-800 pb-4">
                        <h3 className="text-2xl font-black flex items-center gap-3">
                            <TrendingUp size={28} className="text-emerald-400" />
                            لوحة الشرف (أفضل 10)
                        </h3>
                    </div>

                    <div className="space-y-3 relative z-10 overflow-y-auto flex-1 pl-2 custom-scrollbar">
                        {leaderboard.slice(0, 10).map((user, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 transition-all hover:bg-slate-700 hover:-translate-y-0.5 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-lg",
                                        i === 0 ? "bg-amber-400 text-amber-900 shadow-amber-500/30" :
                                            i === 1 ? "bg-slate-200 text-slate-800 shadow-slate-300/30" :
                                                i === 2 ? "bg-orange-400 text-orange-950 shadow-orange-500/30" :
                                                    "bg-slate-700 text-slate-300"
                                    )}>
                                        <span dir="ltr">#{i + 1}</span>
                                    </div>
                                    <span className="font-bold text-lg truncate w-32 md:w-56" dir="rtl">{user.name}</span>
                                </div>
                                <div className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                                    <span className="text-emerald-400 font-black flex items-center gap-1" dir="ltr">
                                        {user.points} <span className="text-[10px] opacity-60 text-slate-400">XP</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                        {leaderboard.length === 0 && (
                            <div className="text-center text-slate-500 font-bold py-10">لا يوجد متصدرين بعد.</div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // -------------------------------------------------------------
    // PROFILE TAB: Goals, Badges, Mastery
    // -------------------------------------------------------------
    const renderProfile = () => (
        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8" dir="rtl">
            <div className="mb-6">
                <h2 className={`text-3xl font-black flex items-center gap-3 mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    <User size={32} className="text-indigo-500" />
                    إنجازاتي وملفي
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">تابع تطور مهاراتك، وإنجازاتك الشخصية.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mastery Radar Chart Widget */}
                <div className={`rounded-[2rem] p-8 shadow-xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-slate-200/40'}`}>
                    <h3 className={`text-xl font-black mb-6 flex items-center gap-2 w-full pb-4 border-b ${isDark ? 'text-slate-100 border-slate-700' : 'text-slate-800 border-slate-100'}`}>
                        <Radar className="text-sky-500" size={24} />
                        خريطة الكفاءات (الرادار)
                    </h3>

                    <div className="w-full h-[300px] flex items-center justify-center">
                        {masteryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={masteryData}>
                                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: '#475569', fontSize: 12, fontWeight: '900', fontFamily: 'Cairo' }}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Mastery"
                                        dataKey="A"
                                        stroke="#0ea5e9"
                                        strokeWidth={3}
                                        fill="#38bdf8"
                                        fillOpacity={0.4}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-slate-400 font-bold text-sm text-center bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
                                <Radar size={40} className="mx-auto mb-3 opacity-30" />
                                أكمل دروسك لترى تحليل ذكاء لمهاراتك الفردية!
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <PersonalGoalsWidget />
                </div>
            </div>

            {/* Badges Section */}
            <div className={`rounded-[2rem] p-8 shadow-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-slate-200/40'}`}>
                <h3 className={`text-xl font-black mb-8 flex items-center gap-3 pb-4 border-b ${isDark ? 'text-slate-100 border-slate-700' : 'text-slate-800 border-slate-100'}`}>
                    <Award className="text-amber-500" size={28} /> أوسمتي ومكافآتي
                </h3>

                {stats?.badges?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {stats.badges.map(badge => (
                            <div key={badge.id} className="flex flex-col items-center gap-3 group relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover:-translate-y-2 group-hover:shadow-indigo-500/50 transition-all duration-300 cursor-help relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_forwards]" />
                                    <Zap size={40} className="drop-shadow-lg" />
                                </div>
                                <span className={`text-sm font-black text-center leading-snug transition-colors ${isDark ? 'text-slate-300 group-hover:text-indigo-400' : 'text-slate-700 group-hover:text-indigo-600'}`}>{badge.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-2xl p-10 flex items-center justify-center flex-col text-slate-400 font-bold border-2 border-dashed border-slate-200">
                        <Trophy size={56} className="mb-4 text-slate-300" />
                        <p className="text-lg">لوحة الأوسمة فارغة. انطلق وأكمل التحديات لتحصد الميداليات!</p>
                    </div>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-8 relative" dir="rtl">
            <SEO
                title="لوحة تحكم الطالب"
                description="تابع تقدمك في مادة الرياضيات، واكتشف دروسك الجديدة والمهمات اليومية في منصة النجاح."
            />

            {/* Minimalist Tab Navigation Hub */}
            <div className="flex justify-center mb-8 sticky top-[4.5rem] md:top-[5.5rem] z-40 px-4">
                <div className={`p-1.5 md:p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border inline-flex gap-1 overflow-x-auto custom-scrollbar max-w-full backdrop-blur-md ${isDark ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/90 border-slate-100/50'}`}>
                    {[
                        { id: 'home', icon: Home, label: 'لوحتي' },
                        { id: 'path', icon: Map, label: 'المسار' },
                        { id: 'arena', icon: Swords, label: 'الساحة' },
                        { id: 'profile', icon: User, label: 'الملف' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center justify-center gap-2 px-5 py-2.5 md:py-3 rounded-full font-black text-sm md:text-base transition-all duration-300 whitespace-nowrap",
                                activeTab === tab.id
                                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 ring-2 ring-sky-500/20'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                            )}
                        >
                            <tab.icon size={18} strokeWidth={2.5} className={activeTab === tab.id ? 'animate-bounce-slight' : ''} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-2 md:px-0">
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && renderHome()}
                    {activeTab === 'path' && renderPath()}
                    {activeTab === 'arena' && renderArena()}
                    {activeTab === 'profile' && renderProfile()}
                </AnimatePresence>
            </main>
        </div>
    );
}
