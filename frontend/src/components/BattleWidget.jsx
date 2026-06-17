import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Sword, Users, Play, CheckCircle2, XCircle, Timer, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useAuthStore from '../store/useAuthStore';

export default function BattleWidget() {
    const [battles, setBattles] = useState([]);
    const [players, setPlayers] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const currentUser = useAuthStore(state => state.user);

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
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return null;

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full relative overflow-hidden" dir="rtl">
            {/* Background Decoration */}
            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-rose-500/5 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10 border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                        <div className="bg-rose-100 p-2.5 rounded-2xl text-rose-500 shadow-inner">
                            <Sword size={24} />
                        </div>
                        ساحة التحدي المحتدم
                    </h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">تغلب على أصدقائك في تحديات الرياضيات السريعة</p>
                </div>

                <button
                    onClick={() => setIsChallengeModalOpen(true)}
                    className="px-5 py-3 bg-rose-500 text-white rounded-2xl font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30 flex items-center gap-2 active:scale-95 ring-2 ring-rose-500/20"
                >
                    <ShieldAlert size={18} /> تحدي جديد
                </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative z-10 flex-1">
                {battles.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-base font-bold">الساحة هادئة جداً اليوم...</p>
                        <p className="text-slate-400 text-sm mt-1">اضغط على "تحدي جديد" لإشعال المنافسة!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {battles.map((battle, index) => (
                            <motion.div
                                key={battle.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <BattleCard battle={battle} currentUser={currentUser} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Challenge Modal */}
            <AnimatePresence>
                {isChallengeModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10" />

                            <h2 className="text-3xl font-black text-slate-800 mb-8 text-center flex items-center justify-center gap-3">
                                إطلاق تحدي <Sword className="text-rose-500" size={28} />
                            </h2>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-sm font-black text-slate-500 mb-3 flex items-center gap-2">
                                        <Users size={18} /> اختر الخصم
                                    </label>
                                    <div className="relative">
                                        <select
                                            onChange={(e) => setSelectedOpponent(e.target.value)}
                                            className="w-full p-4 pl-10 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-700 outline-none appearance-none"
                                        >
                                            <option value="">-- اضغط لاختيار طالب --</option>
                                            {players.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (Lvl {p.level})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-slate-500 mb-3 flex items-center gap-2">
                                        <Sparkles size={18} /> حدد محور التحدي (الدرس)
                                    </label>
                                    <div className="relative">
                                        <select
                                            onChange={(e) => setSelectedLesson(e.target.value)}
                                            className="w-full p-4 pl-10 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-700 outline-none appearance-none"
                                        >
                                            <option value="">-- اضغط لاختيار محور --</option>
                                            {lessons.map(l => (
                                                <option key={l.id} value={l.id}>{l.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={handleChallenge}
                                        disabled={!selectedOpponent || !selectedLesson}
                                        className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                    >
                                        أرسل التحدي!
                                    </button>
                                    <button
                                        onClick={() => setIsChallengeModalOpen(false)}
                                        className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-colors"
                                    >
                                        تراجع
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BattleCard({ battle, currentUser }) {
    const navigate = useNavigate();
    // Use auth context user to determine if current user is challenger
    const isChallenger = battle.challenger_id === currentUser?.id;
    const opponent = isChallenger ? battle.opponent : battle.challenger;
    const myScore = isChallenger ? battle.challenger_score : battle.opponent_score;
    const opponentScore = isChallenger ? battle.opponent_score : battle.challenger_score;

    return (
        <div className="group bg-white border-2 border-slate-100 p-5 rounded-3xl hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

            {/* Status indicator line */}
            <div className={clsx(
                "absolute top-0 right-0 w-1.5 h-full transition-colors",
                battle.status === 'completed'
                    ? (myScore >= opponentScore ? "bg-emerald-500" : "bg-rose-500")
                    : "bg-amber-400"
            )} />

            <div className="flex items-center gap-4 flex-1">
                <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors",
                    battle.status === 'completed'
                        ? (myScore >= opponentScore ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500")
                        : "bg-amber-100 text-amber-500"
                )}>
                    {battle.status === 'completed' ? (
                        myScore >= opponentScore ? <CheckCircle2 size={24} /> : <XCircle size={24} />
                    ) : (
                        <Timer size={24} className="animate-pulse" />
                    )}
                </div>

                <div className="flex-1">
                    <div className="text-[10px] font-black uppercase flex items-center gap-1.5 mb-1" dir="rtl">
                        {battle.status === 'completed' ? (
                            <span className={myScore >= opponentScore ? "text-emerald-500" : "text-rose-500"}>
                                {myScore >= opponentScore ? "انتصار مبين!" : "حظ أوفر المرة القادمة"}
                            </span>
                        ) : (
                            <span className="text-amber-500">في انتظار إنهاء التحدي...</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 text-sm">ضد:</span>
                        <span className="font-black text-slate-800 text-base">{opponent.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-bold mt-1 bg-slate-100 inline-block px-2 py-1 rounded-lg">
                        {battle.lesson.name}
                    </div>
                </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between sm:justify-center gap-3 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                <div className="flex items-center gap-3 bg-white sm:bg-slate-50 px-4 py-2 rounded-xl sm:rounded-2xl border border-slate-200">
                    {/* Scores displayed in LTR explicitly to ensure numbers don't flip incorrectly regardless of context */}
                    <div className="flex items-center gap-2 font-black text-xl tracking-wider" dir="ltr">
                        <span className={clsx("w-8 text-center", battle.status === 'completed' ? (myScore >= opponentScore ? "text-emerald-500" : "text-rose-500") : "text-slate-700")}>
                            {myScore}
                        </span>
                        <span className="text-slate-300">-</span>
                        <span className="w-8 text-center text-slate-400">
                            {opponentScore}
                        </span>
                    </div>
                </div>

                {battle.status !== 'completed' && myScore === 0 && (
                    <button
                        onClick={() => navigate(`/student/lessons/${battle.lesson_id}`, { state: { startQuiz: true, battleId: battle.id } })}
                        className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-500/30 hover:bg-rose-600 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Play size={14} className="fill-current" /> خض المعركة
                    </button>
                )}
            </div>
        </div>
    );
}
