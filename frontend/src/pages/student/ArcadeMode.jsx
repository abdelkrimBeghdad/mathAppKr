import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Star, Trophy, ArrowRight, RefreshCw, XCircle, Play, Flame } from 'lucide-react';
import axios from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import SEO from '../../components/common/SEO';

const ArcadeMode = () => {
    const [gameState, setGameState] = useState('idle'); // idle, loading, playing, finished
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [combo, setCombo] = useState(1);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    const timerRef = useRef(null);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get('/arcade/questions');
            setQuestions(response.data);
        } catch (error) {
            console.error("Error fetching arcade questions", error);
            toast.error("فشل في تحميل الأسئلة");
        }
    };

    const fetchLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
            const response = await axios.get('/arcade/leaderboard');
            setLeaderboard(response.data);
        } catch (error) {
            console.error("Error fetching leaderboard", error);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const startGame = async () => {
        setGameState('loading');
        setScore(0);
        setStreak(0);
        setMaxStreak(0);
        setTimeLeft(60);
        setCombo(1);
        setCurrentIdx(0);
        await fetchQuestions();
        setGameState('playing');
    };

    const endGame = useCallback(async () => {
        if (gameState !== 'playing') return;
        setGameState('finished');
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            await axios.post('/arcade/submit', {
                score: score,
                max_streak: maxStreak
            });
            toast.success("تم تسجيل نتيجتك بنجاح!");
            if (score > 100) {
                confetti({
                    particleCount: 200,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
            fetchLeaderboard();
        } catch (error) {
            console.error("Error submitting score", error);
        }
    }, [gameState, score, maxStreak]);

    useEffect(() => {
        if (gameState === 'playing') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState, endGame]);

    const handleAnswer = (option) => {
        const currentQ = questions[currentIdx];
        if (option === currentQ.correct_answer) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > maxStreak) setMaxStreak(newStreak);

            // Combo logic: increase multiplier every 5 correct answers
            const newCombo = Math.min(5, Math.floor(newStreak / 5) + 1);
            setCombo(newCombo);

            setScore(prev => prev + (10 * newCombo));
            setTimeLeft(prev => Math.min(60, prev + 2)); // Bonus time

            toast.success(`+${10 * newCombo}!`, { id: 'arcade-bonus', duration: 1000 });
        } else {
            setStreak(0);
            setCombo(1);
            setTimeLeft(prev => Math.max(0, prev - 5)); // Penalty
            toast.error("-5 ثواني!", { id: 'arcade-penalty', duration: 1000 });
        }

        if (currentIdx + 1 >= questions.length) {
            fetchQuestions().then(() => setCurrentIdx(0));
        } else {
            setCurrentIdx(prev => prev + 1);
        }
    };

    if (gameState === 'idle') {
        return (
            <div className="max-w-6xl mx-auto space-y-12" dir="rtl">
                <SEO title="ثورة الأرقام: Speed Blitz" description="تحدَّ سرعتك الذهنية في حساب الأرقام على منصة النجاح." />
                <header className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-6 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-[2.5rem] shadow-2xl mb-6"
                    >
                        <Zap size={64} className="text-white animate-pulse" fill="white" />
                    </motion.div>
                    <h1 className="text-5xl font-black text-slate-800 dark:text-slate-100 font-cairo">ثورة الأرقام: Speed Blitz</h1>
                    <p className="text-xl text-slate-500 font-medium">تحدَّ سرعتك الذهنية، اجمع النقاط، وحطم الأرقام القياسية!</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 shadow-xl border-2 border-slate-100 dark:border-slate-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[100px] rounded-full" />
                            <div className="relative z-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                                            <Clock size={20} className="text-sky-500" /> الوقت المتاح
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">تبدأ بـ 60 ثانية. كل إجابة صحيحة تمنحك +2 ثانية.</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                                            <Flame size={20} className="text-orange-500" /> نظام الكومبو
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">سلسلة الإجابات الصحيحة تضاعف نقاطك حتى X5!</p>
                                    </div>
                                </div>
                                <button
                                    onClick={startGame}
                                    className="w-full bg-slate-900 dark:bg-sky-500 hover:scale-[1.02] active:scale-95 text-white py-6 rounded-3xl font-black text-2xl shadow-2xl transition-all flex items-center justify-center gap-4"
                                >
                                    <Play size={32} fill="currentColor" /> ابدأ التحدي الآن
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-xl border-2 border-slate-100 dark:border-slate-700 flex flex-col h-[500px]">
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
                            <Trophy className="text-amber-500" /> أفضل اللاعبين
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {loadingLeaderboard ? (
                                <div className="flex items-center justify-center h-full text-slate-400">جاري التحميل...</div>
                            ) : leaderboard.map((entry, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-500 text-amber-950' : idx === 1 ? 'bg-slate-300' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{entry.user.name}</span>
                                    </div>
                                    <span className="font-black text-sky-600">{entry.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'loading') return <LoadingScreen message="جاري توليد المسائل..." />;

    if (gameState === 'playing') {
        const currentQ = questions[currentIdx];
        if (!currentQ) return null;

        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-4xl space-y-12">
                    {/* HUD */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">السكور الحالي</div>
                                <div className="text-5xl font-black text-sky-600">{score}</div>
                            </div>
                            <div className={`text-center transition-all ${streak > 0 ? 'scale-110' : 'opacity-0'}`}>
                                <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">الكومبو</div>
                                <div className="text-4xl font-black text-orange-500">X{combo}</div>
                            </div>
                        </div>

                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-slate-200 dark:text-slate-800"
                                />
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={364.4}
                                    strokeDashoffset={364.4 - (364.4 * timeLeft) / 60}
                                    className={`transition-all duration-1000 ${timeLeft < 10 ? 'text-rose-500' : 'text-sky-500'}`}
                                />
                            </svg>
                            <span className={`absolute text-4xl font-black font-mono ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>
                                {timeLeft}
                            </span>
                        </div>
                    </div>

                    {/* Question Card */}
                    <motion.div
                        key={currentIdx}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-[4rem] p-16 shadow-2xl border-2 border-slate-100 dark:border-slate-700 text-center space-y-12"
                    >
                        <h2 className="text-7xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tighter">
                            {currentQ.question_text}
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            {currentQ.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(opt)}
                                    className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 text-3xl font-black text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all hover:-translate-y-1 active:scale-95 shadow-sm hover:shadow-xl"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Footer Streaks */}
                    <div className="flex justify-center gap-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-2 w-12 rounded-full transition-all duration-500 ${streak % 5 > i || (streak > 0 && streak % 5 === 0) ? 'bg-orange-500 shadow-lg shadow-orange-500/50 scale-110' : 'bg-slate-200'}`} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-slate-800 rounded-[4rem] p-16 max-w-2xl w-full text-center shadow-2xl space-y-10 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 to-indigo-600" />

                    <div className="space-y-4">
                        <div className="w-24 h-24 bg-amber-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Trophy size={48} className="text-amber-500" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 font-cairo">انتهى الوقت! 🏁</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="p-8 bg-sky-50 dark:bg-sky-900/20 rounded-[2.5rem] border border-sky-100 dark:border-sky-800/30">
                            <div className="text-sm font-black text-sky-600 uppercase tracking-widest mb-1">النتيجة النهائية</div>
                            <div className="text-5xl font-black text-sky-700 dark:text-sky-300">{score}</div>
                        </div>
                        <div className="p-8 bg-orange-50 dark:bg-orange-900/20 rounded-[2.5rem] border border-orange-100 dark:border-orange-800/30">
                            <div className="text-sm font-black text-orange-600 uppercase tracking-widest mb-1">أعلى سلسلة</div>
                            <div className="text-5xl font-black text-orange-700 dark:text-orange-300">{maxStreak}</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={startGame}
                            className="flex-1 bg-slate-900 dark:bg-sky-500 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <RefreshCw size={24} /> المحاولة مرة أخرى
                        </button>
                        <button
                            onClick={() => setGameState('idle')}
                            className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-5 rounded-2xl font-black text-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                        >
                            <XCircle size={24} /> إغلاق
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return null;
};

export default ArcadeMode;
