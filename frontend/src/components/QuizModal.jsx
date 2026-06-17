import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Clock, Award, Star, Zap } from 'lucide-react';
import api from '../api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import MathText from './MathText';
import clsx from 'clsx';

export default function QuizModal({ lessonId, lessonName, battleId, onClose }) {
    const queryClient = useQueryClient();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
    const [isFinished, setIsFinished] = useState(false);
    const { refreshUser } = useAuth();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const { data } = await api.get(`/student/lessons/${lessonId}/quiz`);
                setQuestions(data);
                // Set time based on question count (2 mins per question)
                setTimeLeft(data.length * 120);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [lessonId]);

    useEffect(() => {
        if (loading || isFinished || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, isFinished, timeLeft]);

    const handleAnswer = (option) => {
        setAnswers({ ...answers, [questions[currentIndex].id]: option });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const timeTaken = (questions.length * 120) - timeLeft;
            const { data } = await api.post(`/student/lessons/${lessonId}/quiz`, {
                answers,
                time_taken: timeTaken
            });
            setResult(data);

            // If it's a battle, submit score to battle endpoint too
            if (battleId) {
                await api.post(`/student/battles/${battleId}/submit`, {
                    score: data.result.score
                });
            }

            setIsFinished(true);

            // Sync user data to update points in header
            await refreshUser();

            // Invalidate React Query cache to reflect new scores in Dashboard/Path
            queryClient.invalidateQueries({ queryKey: ['learningPath'] });
            queryClient.invalidateQueries({ queryKey: ['studentStats'] });
            queryClient.invalidateQueries({ queryKey: ['studentMastery'] });
            queryClient.invalidateQueries({ queryKey: ['studentStructure'] });
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return null; // Or a mini loader

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            dir="rtl"
        >
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">اختبار: {lessonName}</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                <Clock size={14} />
                                {formatTime(timeLeft)}
                            </span>
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                {currentIndex + 1} / {questions.length}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-slate-100 w-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-sky-400 to-indigo-500"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    <AnimatePresence mode="wait">
                        {questions.length === 0 ? (
                            <div className="text-center py-10 space-y-4">
                                <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto text-slate-400">
                                    <X size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">لا توجد أسئلة متوفرة حالياً</h3>
                                <p className="text-slate-500">سيتم إضافة أسئلة لهذا الدرس قريباً.</p>
                                <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold">العودة</button>
                            </div>
                        ) : !isFinished ? (
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <MathText
                                    text={questions[currentIndex]?.question_text || ''}
                                    className="text-2xl font-bold text-slate-800 leading-relaxed block text-center"
                                />

                                {(!questions[currentIndex]?.options || questions[currentIndex].options.length === 0 || questions[currentIndex].type === 'text') ? (
                                    <div className="flex flex-col items-center justify-center gap-4 py-4">
                                        <input 
                                            type="text" 
                                            value={answers[questions[currentIndex]?.id] || ''}
                                            onChange={(e) => handleAnswer(e.target.value)}
                                            className="w-full max-w-md bg-slate-50 border-2 border-slate-200 focus:border-sky-500 rounded-2xl px-6 py-4 text-center font-black text-2xl text-slate-800 outline-none transition-all shadow-inner"
                                            placeholder="أدخل إجابتك هنا..."
                                            dir="ltr"
                                            autoFocus
                                        />
                                        <div className="flex gap-2" dir="ltr">
                                            <button onClick={() => { handleAnswer((answers[questions[currentIndex]?.id] || '') + '√'); document.querySelector('input')?.focus(); }} className="w-10 h-10 bg-white text-slate-700 rounded-xl font-serif text-lg hover:bg-slate-100 hover:text-sky-600 transition-all border border-slate-200 shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 relative group">
                                                √
                                                <span className="absolute -top-8 bg-slate-800 text-white text-[10px] whitespace-nowrap font-cairo px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">جذر تربيعي</span>
                                            </button>
                                            <button onClick={() => { handleAnswer((answers[questions[currentIndex]?.id] || '') + '²'); document.querySelector('input')?.focus(); }} className="w-10 h-10 bg-white text-slate-700 rounded-xl font-serif text-lg hover:bg-slate-100 hover:text-sky-600 transition-all border border-slate-200 shadow-sm flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 relative group">
                                                x²
                                                <span className="absolute -top-8 bg-slate-800 text-white text-[10px] whitespace-nowrap font-cairo px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">قوة (أس)</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {questions[currentIndex]?.options?.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswer(opt)}
                                                className={clsx(
                                                    "w-full p-5 rounded-2xl border-2 transition-all duration-300 font-bold text-lg text-right flex items-center justify-between group",
                                                    answers[questions[currentIndex]?.id] === opt
                                                        ? "bg-sky-50 border-sky-500 text-sky-700 shadow-lg shadow-sky-500/10"
                                                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                )}
                                            >
                                                <MathText text={opt} />
                                                <div className={clsx(
                                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 mr-4",
                                                    answers[questions[currentIndex]?.id] === opt
                                                        ? "border-sky-500 bg-sky-500 text-white"
                                                        : "border-slate-200"
                                                )}>
                                                    {answers[questions[currentIndex]?.id] === opt && <CheckCircle2 size={16} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-10 space-y-8"
                            >
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 bg-amber-100 rounded-[2.5rem] flex items-center justify-center mx-auto rotate-12 relative z-10">
                                        <Award className="text-amber-500" size={64} />
                                    </div>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-4 border-dashed border-amber-200 rounded-[2.5rem]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-slate-800">
                                        {result?.score >= 90 ? 'نتيجة أسطورية! 🏆' : 
                                         result?.score >= 60 ? 'عمل رائع! 👍' : 
                                         'حاول مرة أخرى! 💪'}
                                    </h3>
                                    <p className="text-slate-500 font-medium text-lg">
                                        {result?.score >= 60 ? 'لقد أنهيت الاختبار بنجاح.' : 'يمكنك مراجعة الدرس والمحاولة مجدداً لتحسين درجتك.'}
                                    </p>
                                </div>

                                <div className="flex justify-center gap-6">
                                    <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-100/50 min-w-[140px]">
                                        <div className="text-[10px] font-black uppercase text-slate-400 mb-1">النتيجة النهائية</div>
                                        <div className="text-4xl font-black text-rose-500">{result?.result.score}%</div>
                                    </div>
                                    <div className="bg-sky-50 p-6 rounded-3xl border-2 border-sky-100 shadow-xl shadow-sky-500/10 min-w-[140px]">
                                        <div className="text-[10px] font-black uppercase text-sky-400 mb-1">النقاط المحصلة</div>
                                        <div className="text-4xl font-black text-sky-600">+{result?.reward.xp_added}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                                >
                                    العودة للدرس
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                {!isFinished && (
                    <div className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <button
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(currentIndex - 1)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            <ChevronLeft size={20} className="rotate-180" /> السابق
                        </button>

                        {currentIndex === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !answers[questions[currentIndex]?.id]}
                                className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                            >
                                {submitting ? 'جاري الإرسال...' : 'إنهاء الاختبار'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIndex(currentIndex + 1)}
                                disabled={!answers[questions[currentIndex]?.id]}
                                className="flex items-center gap-2 px-8 py-3 bg-sky-500 text-white rounded-2xl font-black hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
                            >
                                التالي <ChevronRight size={20} className="rotate-180" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
