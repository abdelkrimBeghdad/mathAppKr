import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, Star, ArrowRight, Shield, Award, Medal, CheckCircle2 } from 'lucide-react';
import axios from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';
import { toast } from 'react-hot-toast';

const TournamentDetail = () => {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const [tournamentRes, leaderboardRes] = await Promise.all([
                    axios.get(`/tournaments/${tournamentId}`),
                    axios.get(`/tournaments/${tournamentId}/leaderboard`)
                ]);
                setTournament(tournamentRes.data);
                setLeaderboard(leaderboardRes.data);
            } catch (error) {
                console.error("Error fetching tournament details", error);
                toast.error("فشل في تحميل تفاصيل البطولة");
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [tournamentId]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            await axios.post(`/tournaments/${tournamentId}/join`);
            toast.success("تم الانضمام للبطولة بنجاح!");
            navigate(`/student/tournaments/${tournamentId}/arena`);
        } catch (error) {
            toast.error(error.response?.data?.message || "فشل في الانضمام للبطولة");
        } finally {
            setJoining(false);
        }
    };

    if (loading) return <LoadingScreen message="جاري تحميل التفاصيل..." />;
    if (!tournament) return <div>لم يتم العثور على البطولة</div>;

    const isActive = tournament.status === 'active';

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <header className="relative bg-slate-900 rounded-[3rem] p-12 overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-600/30 to-indigo-600/30" />
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-sky-500/20 blur-[100px] rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/20 shadow-2xl">
                        <Trophy size={64} className="text-amber-400 scale-110 drop-shadow-lg" />
                    </div>
                    <div className="flex-1 text-center md:text-right">
                        <h1 className="text-4xl md:text-5xl font-black mb-4 font-cairo leading-tight">
                            {tournament.title}
                        </h1>
                        <p className="text-sky-100 text-lg opacity-80 max-w-2xl font-medium leading-relaxed">
                            {tournament.description}
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <button
                            onClick={handleJoin}
                            disabled={!isActive || joining}
                            className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3
                                ${isActive
                                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-amber-500/20 hover:-translate-y-1'
                                    : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'}`}
                        >
                            {joining ? 'جاري الانضمام...' : isActive ? 'دخول المسابقة 🚀' : 'غير متاحة حالياً'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Stats & Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border-2 border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50">
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
                            <Shield className="text-sky-500" /> تفاصيل الجوائز
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-600">
                                        <Award size={20} />
                                    </div>
                                    <span className="font-black text-slate-700 dark:text-slate-300">العملات الممنوحة</span>
                                </div>
                                <span className="text-2xl font-black text-amber-600">{tournament.prize_coins}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-sky-50 dark:bg-sky-900/20 rounded-2xl border border-sky-100 dark:border-sky-800/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/40 rounded-xl flex items-center justify-center text-sky-600">
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                    <span className="font-black text-slate-700 dark:text-slate-300">نقاط الخبرة XP</span>
                                </div>
                                <span className="text-2xl font-black text-sky-600">{tournament.prize_xp}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 space-y-4">
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-slate-400">تاريخ البدء:</span>
                                <span className="text-slate-700 dark:text-slate-200">{new Date(tournament.start_time).toLocaleDateString('ar-DZ')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-slate-400">تاريخ الانتهاء:</span>
                                <span className="text-slate-700 dark:text-slate-200">{new Date(tournament.end_time).toLocaleDateString('ar-DZ')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-slate-400">مستوى المشاركة:</span>
                                <span className="text-sky-600">المستوى {tournament.min_level} فما فوق</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border-2 border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 min-h-[500px]">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-4">
                                <Medal className="text-amber-500" /> لوحة الصدارة الحية
                            </h3>
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                <Users size={16} />
                                <span>{leaderboard.length} متسابق أنهى التحدي</span>
                            </div>
                        </div>

                        {leaderboard.length > 0 ? (
                            <div className="space-y-4">
                                {leaderboard.map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all
                                            ${index === 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' :
                                                index === 1 ? 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700' :
                                                    'bg-white border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50'}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm
                                                ${index === 0 ? 'bg-amber-500 text-amber-950' :
                                                    index === 1 ? 'bg-slate-300 text-slate-800' :
                                                        index === 2 ? 'bg-orange-400 text-orange-950' : 'bg-slate-100 text-slate-400'}`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{entry.user.name}</h4>
                                                <div className="flex items-center gap-3 text-slate-400 text-xs font-bold mt-1">
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {Math.floor(entry.time_taken / 60)}د {entry.time_taken % 60}ث</span>
                                                    <span>•</span>
                                                    <span>{new Date(entry.finished_at).toLocaleTimeString('ar-DZ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{entry.score}%</div>
                                                <div className="text-[10px] font-black uppercase text-slate-400 text-center">النتيجة الكلية</div>
                                            </div>
                                            {index === 0 && <Star className="text-amber-500 animate-pulse" fill="currentColor" size={24} />}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <Clock size={32} />
                                </div>
                                <p className="font-bold text-lg">بانتظار المتسابقين الأوائل!</p>
                                <p className="text-sm font-medium">كن أول من يترك بصمته في لوحة الصدارة</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetail;
