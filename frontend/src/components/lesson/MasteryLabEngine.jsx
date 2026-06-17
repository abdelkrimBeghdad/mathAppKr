import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, AlertCircle, Lightbulb, 
    ArrowRight, ArrowLeft, Trophy, Target, 
    RefreshCcw, Sparkles, HelpCircle, BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * MasteryLabEngine
 * A standardized pedagogical engine for step-by-step interactive learning.
 * @param {Object} config - The lab configuration (lessons, challenges, theme)
 */
export default function MasteryLabEngine({ config }) {
    const [phase, setPhase] = useState('theory'); // theory, guided, mastery
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentTask, setCurrentTask] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const { themeColor = 'indigo', title, lessons, challenges } = config;

    // Derived State
    const currentLesson = lessons[currentSlide];
    const challenge = challenges[currentTask];
    const isLastSlide = currentSlide === lessons.length - 1;
    const isLastTask = currentTask === challenges.length - 1;

    // --- Logic Handlers ---

    const handleNextSlide = () => {
        if (!isLastSlide) {
            setCurrentSlide(prev => prev + 1);
        } else {
            setPhase('guided');
        }
    };

    const handleAnswerSubmit = () => {
        const normalizedInput = userInput.trim().toLowerCase();
        const expected = challenge.answer.toString().toLowerCase();

        if (normalizedInput === expected) {
            handleSuccess();
        } else {
            handleFailure();
        }
    };

    const handleSuccess = () => {
        setFeedback({ type: 'success', text: challenge.successMsg || 'أحسنت! إجابة دقيقة ✓' });
        confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: [themeColor === 'indigo' ? '#4f46e5' : '#10b981', '#fbbf24']
        });
        
        setTimeout(() => {
            if (!isLastTask) {
                setCurrentTask(prev => prev + 1);
                setUserInput('');
                setFeedback(null);
                setShowHint(false);
                setAttempts(0);
            } else {
                setIsCompleted(true);
            }
        }, 1500);
    };

    const handleFailure = () => {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setFeedback({ 
            type: 'error', 
            text: newAttempts >= 2 ? 'تلميح: ' + challenge.hint : 'حاول مرة أخرى، أنت قادم!' 
        });
        if (newAttempts >= 2) setShowHint(true);
    };

    const resetLab = () => {
        setPhase('theory');
        setCurrentSlide(0);
        setCurrentTask(0);
        setUserInput('');
        setFeedback(null);
        setIsCompleted(false);
        setScore(0);
    };

    // --- Sub-Components ---

    const ProgressBar = () => (
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
            <motion.div 
                className={`h-full bg-${themeColor}-600`}
                initial={{ width: 0 }}
                animate={{ width: `${((phase === 'theory' ? currentSlide : currentTask + lessons.length) / (lessons.length + challenges.length)) * 100}%` }}
            />
        </div>
    );

    // --- Renderers ---

    if (isCompleted) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-12 text-center space-y-8">
                <div className={`w-32 h-32 bg-${themeColor}-100 rounded-full flex items-center justify-center text-${themeColor}-600 shadow-xl`}>
                    <Trophy size={64} />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">بطل الإتقان! 🎉</h2>
                    <p className="text-xl text-slate-500 font-medium">لقد أتممت مختبر {title} بنجاح باهر.</p>
                </div>
                <button 
                    onClick={resetLab}
                    className={`px-4 py-2 bg-${themeColor}-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-${themeColor}-500/30 transition-all flex items-center gap-3`}
                >
                    <RefreshCcw size={20} /> إعادة التجربة للتميز
                </button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8" dir="rtl">
            <ProgressBar />

            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[300px] flex flex-col">
                {/* Header Info */}
                <div className={`p-6 bg-gradient-to-r from-${themeColor}-600 to-${themeColor}-500 text-white flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Target size={20} />
                        </div>
                        <h3 className="font-black text-lg">{title}</h3>
                    </div>
                    <div className="bg-black/10 px-4 py-1.5 rounded-full text-xs font-bold font-mono">
                        {phase === 'theory' ? 'مرحلة الاكتشاف' : 'مرحلة الإتقان'}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-6 flex-grow flex flex-col">
                    <AnimatePresence mode="wait">
                        {phase === 'theory' ? (
                            <motion.div 
                                key={`lesson-${currentSlide}`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                className="space-y-8 flex-grow"
                            >
                                <div className="space-y-2">
                                    <div className={`text-${themeColor}-600 font-black text-sm uppercase tracking-widest`}>
                                        الخطوة {currentSlide + 1}
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                        {currentLesson.title}
                                    </h2>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                        {currentLesson.content}
                                    </p>
                                </div>

                                {currentLesson.visual && (
                                    <div className="flex justify-center py-2">
                                        {currentLesson.visual}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key={`challenge-${currentTask}`}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="space-y-8 flex-grow"
                            >
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-100 text-amber-700 rounded-full font-black text-xs uppercase">
                                        <Sparkles size={14} /> تحدي الذكاء
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                                        {challenge.question}
                                    </h2>
                                </div>

                                <div className="max-w-md mx-auto space-y-6">
                                    <div className="relative group">
                                        <input 
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            placeholder="أدخل إجابتك هنا..."
                                            className="w-full text-center text-xl font-black py-3 bg-slate-50 dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 rounded-[1.5rem] focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all dark:text-white shadow-inner"
                                            autoFocus
                                            onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                                        />
                                    </div>

                                    <button 
                                        onClick={handleAnswerSubmit}
                                        disabled={!userInput}
                                        className={`w-full py-5 bg-${themeColor}-600 disabled:bg-slate-300 text-white rounded-[1.5rem] font-black text-xl shadow-lg hover:shadow-${themeColor}-500/30 transition-all active:scale-95`}
                                    >
                                        تحقق من الإجابة
                                    </button>

                                    {feedback && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`p-4 rounded-3xl flex items-center justify-center gap-3 font-black text-sm ${
                                                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                            }`}
                                        >
                                            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                            {feedback.text}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {phase === 'theory' ? (
                        <>
                            <div className="flex gap-2">
                                <span className={`w-3 h-3 rounded-full bg-${themeColor}-600 opacity-20`} />
                                <span className={`w-3 h-3 rounded-full bg-${themeColor}-600 opacity-40`} />
                                <span className={`w-3 h-3 rounded-full bg-${themeColor}-600 opacity-100`} />
                            </div>
                            <button 
                                onClick={handleNextSlide}
                                className={`px-8 py-3 bg-${themeColor}-600 text-white rounded-2xl font-black hover:bg-${themeColor}-700 transition-all flex items-center gap-3 shadow-md`}
                            >
                                {isLastSlide ? 'ابدأ التحدي الإتقاني' : 'الخطوة التالية'}
                                <ArrowLeft size={20} className="rotate-180" />
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-500 font-bold">
                                <HelpCircle size={18} />
                                محاولة رقم: {attempts + 1}
                            </div>
                            <div className="text-amber-500 font-black flex items-center gap-2">
                                <Sparkles size={20} />
                                إتقانك في تزايد!
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Contextual Encouragement */}
            <div className="mt-4 flex items-center justify-center gap-4 opacity-40 pointer-events-none select-none">
                <div className="flex items-center gap-2 font-black text-slate-400 italic">
                    <BookOpen size={20} /> تعلم هادف
                </div>
                <div className="flex items-center gap-2 font-black text-slate-400 italic">
                    <Lightbulb size={20} /> ذكاء فطري
                </div>
                <div className="flex items-center gap-2 font-black text-slate-400 italic">
                    <Trophy size={20} /> إتقان تام
                </div>
            </div>
        </div>
    );
}
