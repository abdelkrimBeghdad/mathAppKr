import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Send, HelpCircle, BookOpen, Pencil, Activity, TrendingUp, Target, Zap, LineChart } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function AffineFunctionsContent() {
    const { theme, isDarkMode, currentAccent } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userInput, setUserInput] = useState({ a: '', b: '', y: '', x: '' });
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(1);

    useEffect(() => {
        labProgressService.getOne('affine-functions')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'ما هي الدالة التآلفية؟',
            detail: 'الدالة التآلفية هي كل دالة تُكتب على الشكل: f(x) = ax + b',
            math: 'حيث a هو معامل التوجيه (الميل) و b هو الترتيب إلى المبدأ.',
            example: 'مثال: f(x) = 2x + 1 \n إذا كان x=0 فإن f(0) = 2(0)+1 = 1.',
            color: 'indigo'
        },
        {
            title: 'حساب الصور',
            detail: 'نعوض x بقيمته ونقوم بضرب النتيجة في a ثم إضافة b.',
            math: 'f(x) = 3x - 2 \u21d2 f(5) = 3(5) - 2 = 13',
            color: 'violet'
        },
        {
            title: 'إيجاد العدد (السابقة)',
            detail: 'نحل المعادلة ax + b = y.',
            math: 'f(x) = 7 \u21d2 2x + 1 = 7 \u21d2 2x = 6 \u21d2 x = 3',
            example: 'العدد الذي صورته 7 بالدالة f(x)=2x+1 هو 3.',
            color: 'indigo'
        },
        {
            title: 'التمثيل البياني',
            detail: 'التمثيل البياني هو مستقيم يقطع محور التراتيب في النقطة (0, b).',
            example: 'لرسمه، يكفي تعيين نقطتين (مثلاً صورة 0 وصورة 1).',
            color: 'violet'
        }
    ];

    const challenges = [
        { q: 'f(x) = 2x + 3 \\\\ \u0623\u0648\u062c\u062f \u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u062f\u062f 4:', a: '11', hint: '2 \u00d7 4 + 3 = 11' },
        { q: 'f(x) = 5x - 1 \\\\ \u0623\u0648\u062c\u062f \u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u062f\u062f 2:', a: '9', hint: '5 \u00d7 2 - 1 = 9' },
        { q: 'f(x) = 3x + 2 \\\\ \u0623\u0648\u062c\u062f \u0627\u0644\u0639\u062f\u062f x \u0627\u0644\u0630\u064a \u0635\u0648\u0631\u062a\u0647 11:', a: '3', hint: '\u062d\u0644 \u0627\u0644\u0645\u0639\u0627\u062f\u0644\u0629: 3x + 2 = 11 \u21d2 3x = 9 \u21d2 x = 3.' },
        { q: 'f(x) = -x + 5 \\\\ \u0623\u0648\u062c\u062f \u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u062f\u062f 6:', a: '-1', hint: '-6 + 5 = -1' },
        { q: '\u062f\u0627\u0644\u0629 \u062a\u0622\u0644\u0641\u064a\u0629 \u0644\u0647\u0627 b=4 \u0648 a=2. \\\\ \u0645\u0627 \u0647\u064a \u0635\u0648\u0631\u062a\u0647\u0627 \u0639\u0646\u062f x=1\u061f', a: '6', hint: '\u0637\u0628\u0642 \u0627\u0644\u0642\u0627\u0644\u0648\u0646 f(1) = 2 \u00d7 1 + 4 = 6.' }
    ];

    const current = challenges[challengeStep];

    const handleAnswer = async () => {
        if (userInput.y.trim() === current.a) {
            setScore(score + 1);
            setFeedback({ type: 'success', text: '\u0625\u062c\u0627\u0628\u0629 \u0645\u0645\u062a\u0627\u0632\u0629! \u0644\u0642\u062f \u0627\u0633\u062a\u0648\u0639\u0628\u062a \u0627\u0644\u0645\u0641\u0647\u0648\u0645 \u2713' });

            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setShowHint(false);
            setUserInput({ a: '', b: '', y: '', x: '' });

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1000);
            } else {
                setCompleted(true);
                try {
                    await labProgressService.update('affine-functions', 'completed', 100);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: '\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u062d\u0633\u0627\u0628. \u0627\u0646\u062a\u0628\u0647 \u0644\u0645\u0639\u0627\u0645\u0644 \u0627\u0644\u062a\u0648\u062c\u064a\u0647 \u0648\u0627\u0644\u062a\u0631\u062a\u064a\u0628 \u0625\u0644\u0649 \u0627\u0644\u0645\u0628\u062f\u0623.' });
        }
    };

    return (
        <div className={`w-full h-full flex flex-col font-sans transition-all duration-500`} dir="rtl">
            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-4 overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                        <motion.button initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onClick={() => { setPhase('learn'); setLearnStep(0); labProgressService.update('affine-functions', 'learn').catch(console.error); }} className={`group relative p-4 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden shadow-2xl ${theme.card}`}>
                             <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center text-white mb-3 shadow-xl transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter ${theme.textMain}`}>أكاديمية الدوال</h3>
                             <p className={`${theme.textSub} text-sm md:text-base font-medium leading-relaxed italic`}>اكتشف أسرار الدوال التآلفية، معامل التوجيه، والتمثيل البياني المستقيم.</p>
                        </motion.button>
                        <motion.button initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onClick={() => { setPhase('practice'); setChallengeStep(0); setScore(0); setCompleted(false); labProgressService.update('affine-functions', 'practice').catch(console.error); }} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 transition-transform duration-500 group-hover:scale-110`} />
                            <div className="relative p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Activity size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">بدء التحدي</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-6xl space-y-8">
                        <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-6">
                                    {learnPages.slice(0, learnStep + 1).map((page, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                            className={`p-6 rounded-[1.5rem] border-2 bg-white/5 border-white/10 shadow-inner`}>
                                            <div className="text-sm font-black text-indigo-400 mb-2 uppercase tracking-widest">{page.title}</div>
                                            <div className="font-black text-base md:text-lg text-white mb-2" dir="ltr">{page.math}</div>
                                            {page.detail && <div className="text-white/70 text-lg font-medium italic">{page.detail}</div>}
                                            {page.example && <div className="text-indigo-200 text-lg mt-4 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 font-mono" dir="ltr">{page.example}</div>}
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="hidden md:flex flex-col items-center justify-center bg-white/5 rounded-[1.5rem] border-2 border-white/10 p-5 relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-40" />
                                     <LineChart size={160} className="text-indigo-400 drop-shadow-[0_0_30px_rgba(129,140,248,0.4)]" />
                                     <div className="mt-4 text-center">
                                         <p className="text-2xl font-black text-white italic">f(x) = ax + b</p>
                                         <p className="text-indigo-300 font-medium">خط مستقيم في الفضاء الإحداثي</p>
                                     </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center">
                            {learnStep < learnPages.length - 1 ? (
                                <button onClick={() => setLearnStep(learnStep + 1)}
                                    className="px-12 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-[1rem] font-black shadow-xl transition-all text-2xl active:scale-95">
                                    الخطوة التالية \u2190
                                </button>
                            ) : (
                                <button onClick={() => { setPhase('practice'); labProgressService.update('affine-functions', 'practice').catch(console.error); }}
                                    className="px-12 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-[1rem] font-black shadow-xl transition-all text-2xl flex items-center gap-4 active:scale-95">
                                    <Pencil size={28} />
                                    ابدأ الاختبار التطبيقي
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !completed && (
                    <div className="flex flex-col items-center w-full max-w-5xl px-4">
                        <div className={`w-full p-12 md:p-16 rounded-[1.5rem] border-2 backdrop-blur-3xl mb-12 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${theme.card}`}>
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 opacity-30" />
                             <div className="absolute top-6 right-10 text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">تحدي {challengeStep + 1} / {challenges.length}</div>
                             <div className="text-xl md:text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" dir="ltr">
                                 {current.q.split('\\\\').map((line, i) => (
                                     <div key={i} className={i > 0 ? 'text-base md:text-lg mt-6 text-indigo-300' : ''}>{line}</div>
                                 ))}
                             </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-2xl">
                            <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 mb-3 backdrop-blur-3xl shadow-2xl ${theme.card}`}>
                                <div className="flex items-center justify-center gap-3">
                                    <input
                                        type="text"
                                        value={userInput.y}
                                        onChange={(e) => setUserInput({ ...userInput, y: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                                        className={`flex-grow bg-white/5 border-4 rounded-[1.5rem] p-6 text-center text-base md:text-lg font-black outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-500' : 'border-indigo-500/30 text-indigo-400 focus:border-indigo-500 shadow-inner'}`}
                                        placeholder="..." dir="ltr"
                                        autoFocus
                                    />
                                    <button onClick={handleAnswer} className="p-8 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-[1rem] shadow-xl active:scale-95 transition-all">
                                        <Send size={36} />
                                    </button>
                                </div>
                                <button onClick={() => setShowHint(!showHint)} className="mt-4 flex items-center gap-3 text-amber-500/60 font-black text-lg hover:text-amber-500 transition-colors mx-auto group">
                                    <HelpCircle size={22} className="group-hover:rotate-12 transition-transform" /> {showHint ? 'إخفاء التلميح' : 'أحتاج تلميحاً ذكياً'}
                                </button>
                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className={`mt-6 p-6 rounded-3xl border-2 text-center bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold text-xl italic shadow-inner`}>
                                            {current.hint}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {feedback && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className={`w-full max-w-2xl p-6 rounded-2xl border-2 text-center font-black text-xl shadow-lg ${feedback.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'}`}>
                                    {feedback.text}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {completed && (
                    <div className="flex flex-col items-center w-full max-w-4xl text-center px-4">
                        <Trophy size={140} className="text-amber-500 mb-3 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-bounce" />
                        <div className={`p-16 rounded-[5rem] border-4 border-indigo-500/40 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 mb-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden`}>
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                             <h3 className="relative z-10 text-xl md:text-8xl font-black text-white mb-3 tracking-tighter italic">رائد الدوال!</h3>
                             <p className="relative z-10 text-indigo-200 text-base md:text-lg font-medium italic leading-relaxed">لقد أتقنت التعامل مع الدوال التآلفية، حساب الصور، وإيجاد السوابق ببراعة مذهلة.</p>
                        </div>
                        <div className="bg-white/10 rounded-[1.5rem] p-8 backdrop-blur-sm inline-block border-2 border-white/10 mb-3">
                            <p className="text-xl font-black text-white">{score} / {challenges.length}</p>
                        </div>
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setCompleted(false); setScore(0); }}
                            className="mt-4 w-full py-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-95">
                            العودة إلى البداية
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AffineFunctionsLab() {
    return (
        <LabShell 
            labId="affine-functions" 
            title="الدوال التآلفية" 
            icon={TrendingUp}
            accentColor="indigo"
            badgeText="أكاديمية الدوال"
            badgeIcon={LineChart}
        >
            <AffineFunctionsContent />
        </LabShell>
    );
}
