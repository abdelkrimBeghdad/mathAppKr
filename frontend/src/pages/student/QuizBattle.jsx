import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Users, Play, CheckCircle2, XCircle, Timer, Star, Trophy, Zap, ChevronRight, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

export default function QuizBattle() {
    const [battles, setBattles] = useState([]);
    const [players, setPlayers] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
    const [selectedOpponent, setSelectedOpponent] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [battlesRes, playersRes, structureRes] = await Promise.all([
                api.get('/student/battles'),
                api.get('/students/players'),
                api.get('/student/structure')
            ]);
            setBattles(battlesRes.data);
            setPlayers(playersRes.data);

            // Flatten lessons for selector
            const allLessons = structureRes.data.flatMap(f =>
                f.sections.flatMap(s => s.lessons)
            );
            setLessons(allLessons.filter(l => !l.is_locked));
        } catch (e) {
            console.error(e);
            toast.error("فشل في تحميل بيانات الساحة");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChallenge = async () => {
        if (!selectedOpponent || !selectedLesson) return;
        try {
            await api.post('/student/battles', {
                opponent_id: selectedOpponent,
                lesson_id: selectedLesson
            });
            setIsChallengeModalOpen(false);
            fetchData();
            toast.success("تم إرسال التحدي بنجاح! ⚔️");
        } catch (e) {
            console.error(e);
            toast.error("حدث خطأ أثناء إرسال التحدي");
        }
    };

    if (loading) return <LoadingScreen message="جاري تجهيز ساحة المعركة..." />;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/student')}
                        className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors text-slate-500"
                    >
                        <ArrowLeft size={24} className="rotate-180" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <Sword className="text-rose-500" size={32} /> ساحة التحدي (Quiz Battle)
                        </h1>
                        <p className="text-slate-500 font-medium">تحدى زملائك واثبت جدارتك في الدروس!</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsChallengeModalOpen(true)}
                    className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-lg hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95 flex items-center gap-2 justify-center"
                >
                    <Zap size={20} fill="currentColor" /> تحدي جديد
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Battles */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-slate-700 flex items-center gap-2 px-4">
                        <Timer size={20} className="text-sky-500" /> التحديات الحالية
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {battles.filter(b => b.status !== 'completed').length === 0 ? (
                            <div className="col-span-full bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
                                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-400 font-bold">لا توجد تحديات نشطة حالياً. ابدأ واحداً الآن!</p>
                            </div>
                        ) : (
                            battles.filter(b => b.status !== 'completed').map(battle => (
                                <BattleCard key={battle.id} battle={battle} onUpdate={fetchData} />
                            ))
                        )}
                    </div>

                    <h2 className="text-xl font-black text-slate-700 flex items-center gap-2 px-4 pt-4">
                        <Trophy size={20} className="text-amber-500" /> سجل التحديات
                    </h2>

                    <div className="space-y-4">
                        {battles.filter(b => b.status === 'completed').length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-8 text-center border border-slate-100 italic text-slate-400">
                                لم تكتمل أي تحديات بعد.
                            </div>
                        ) : (
                            battles.filter(b => b.status === 'completed').map(battle => (
                                <BattleCard key={battle.id} battle={battle} onUpdate={fetchData} />
                            ))
                        )}
                    </div>
                </div>

                {/* Leaderboard Mini / Sidebar Stats */}
                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full" />
                        <h3 className="text-xl font-black mb-6 relative z-10 flex items-center gap-2">
                            <Star size={20} className="text-amber-400" /> ملوك الساحة
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {players.slice(0, 5).map((player, i) => (
                                <div key={player.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs",
                                            i === 0 ? "bg-amber-400 text-amber-900" :
                                                i === 1 ? "bg-slate-300 text-slate-900" :
                                                    "bg-orange-400 text-orange-900"
                                        )}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{player.name}</div>
                                            <div className="text-[10px] text-white/50 font-medium">Lvl {player.level}</div>
                                        </div>
                                    </div>
                                    <div className="text-amber-400 font-black">{player.points} <span className="text-[10px] opacity-60">ن</span></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-4">قواعد المعركة 📜</h3>
                        <ul className="space-y-3">
                            {[
                                "اختر خصماً من قائمة الطلاب المتصلين.",
                                "اختر درساً للمنافسة فيه.",
                                "يحصل الفائز على XP مضاعف!",
                                "لديك 5 دقائق لإنهاء الاختبار."
                            ].map((rule, i) => (
                                <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium leading-relaxed">
                                    <span className="w-5 h-5 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Challenge Modal */}
            <AnimatePresence>
                {isChallengeModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] rounded-full" />

                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black text-slate-800">تحدي جديد ⚔️</h2>
                                <button onClick={() => setIsChallengeModalOpen(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">اختر الخصم</label>
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {players.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedOpponent(p.id)}
                                                className={clsx(
                                                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                                                    selectedOpponent === p.id
                                                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-lg shadow-rose-500/10"
                                                        : "bg-slate-50 border-transparent hover:border-slate-200 text-slate-600"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                                                    <span className="font-bold">{p.name}</span>
                                                </div>
                                                <span className="text-xs font-black px-2 py-1 bg-white/50 rounded-lg">Lvl {p.level}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">اختر الدرس</label>
                                    <select
                                        value={selectedLesson}
                                        onChange={(e) => setSelectedLesson(e.target.value)}
                                        className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-rose-500 outline-none font-bold text-slate-700 transition-colors"
                                    >
                                        <option value="">-- اختر درساً للمنافسة --</option>
                                        {lessons.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleChallenge}
                                    disabled={!selectedOpponent || !selectedLesson}
                                    className="w-full py-5 bg-rose-500 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    إرسال التحدي!
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BattleCard({ battle, onUpdate }) {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isChallenger = battle.challenger_id === currentUser?.id;
    const opponent = isChallenger ? battle.opponent : battle.challenger;
    const myScore = isChallenger ? battle.challenger_score : battle.opponent_score;
    const opponentScore = isChallenger ? battle.opponent_score : battle.challenger_score;

    const isCompleted = battle.status === 'completed';
    const hasPlayed = myScore > 0;
    const won = isCompleted && myScore >= opponentScore;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={clsx(
                "bg-white rounded-[2rem] p-6 border-2 transition-all relative overflow-hidden group",
                isCompleted
                    ? (won ? "border-emerald-200 bg-emerald-50/20" : "border-slate-100")
                    : "border-slate-100 hover:border-sky-300 shadow-lg shadow-slate-200/50"
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                        isCompleted ? (won ? "bg-emerald-500" : "bg-slate-400") : "bg-sky-500 animate-pulse-slow"
                    )}>
                        <Sword size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">
                            {isCompleted ? "تحدي مكتمل" : (isChallenger ? "في انتظار الخصم" : "تحدي جديد!")}
                        </div>
                        <h4 className="font-black text-slate-800 text-lg leading-none">{opponent.name}</h4>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-black text-slate-800 tabular-nums">
                        {myScore} - {opponentScore}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">النتيجة</div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between mb-6">
                <div className="text-sm font-bold text-slate-600 truncate max-w-[150px]">
                    {battle.lesson.name}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-100 text-[10px] font-black text-slate-500">
                    <Timer size={12} /> 5 دقائق
                </div>
            </div>

            {!isCompleted && !hasPlayed && (
                <button
                    onClick={() => navigate(`/student/lessons/${battle.lesson_id}`, { state: { startQuiz: true, battleId: battle.id } })}
                    className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                    <Play size={18} fill="currentColor" /> ابدأ التحدي الآن
                </button>
            )}

            {isCompleted && won && (
                <div className="absolute top-2 right-2 rotate-12">
                    <div className="bg-amber-100 text-amber-600 p-2 rounded-xl border-2 border-amber-200">
                        <Trophy size={16} fill="currentColor" />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
