import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, Star, ArrowRight, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await axios.get('/tournaments');
                setTournaments(response.data);
            } catch (error) {
                console.error("Error fetching tournaments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Zap size={10} fill="currentColor" /> مباشر الآن</span>;
            case 'upcoming':
                return <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> قريباً</span>;
            case 'finished':
                return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">انتهى</span>;
            default:
                return null;
        }
    };

    if (loading) return <LoadingScreen message="جاري تحميل البطولات..." />;

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-2 font-cairo">بطولات الرياضيات 🏆</h1>
                    <p className="text-slate-500 font-medium text-lg">تحدَّ أقرانك واربح جوائز قيمة في مسابقات دورية</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tournaments.map((tournament, index) => (
                    <motion.div
                        key={tournament.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-2"
                    >
                        <div className="relative h-48 bg-slate-900 overflow-hidden">
                            {/* Decorative background */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-sky-600/20 to-indigo-600/20" />
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/10 blur-3xl rounded-full" />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <Trophy size={80} className="text-white/10 group-hover:scale-110 transition-transform duration-500" />
                            </div>

                            <div className="absolute top-6 left-6">
                                {getStatusBadge(tournament.status)}
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3 group-hover:text-sky-600 transition-colors">
                                    {tournament.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                                    {tournament.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">الجائزة</span>
                                    </div>
                                    <div className="text-lg font-black text-amber-700 dark:text-amber-300">
                                        {tournament.prize_coins} <span className="text-xs opacity-60">ن</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-2xl border border-sky-100 dark:border-sky-800/30">
                                    <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-1">
                                        <Target size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">المستوى</span>
                                    </div>
                                    <div className="text-lg font-black text-sky-700 dark:text-sky-300">
                                        {tournament.min_level}+
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Users size={16} />
                                    <span className="text-xs font-bold">{tournament.participants_count || 0} مشارك</span>
                                </div>
                                <Link
                                    to={`/student/tournaments/${tournament.id}`}
                                    className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2
                                        ${tournament.status === 'active'
                                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {tournament.status === 'active' ? 'دخول البطولة' : 'التفاصيل'}
                                    <ArrowRight size={16} className="-rotate-180" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Tournaments;
