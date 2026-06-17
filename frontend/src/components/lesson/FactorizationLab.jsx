import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Send, HelpCircle, ArrowRight, Target, RotateCcw, Zap as ZapIcon, Cpu, Sigma, Microscope, BrainCircuit, Rocket, Layers, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function FactorizationContent() {
    const { theme, isDarkMode, currentAccent } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState(0);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('factorization-general')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'ما هو التحليل؟',
            detail: 'التحليل هو عكس النشر. هو كتابة العبارة الجبرية على شكل **جداء** عوامل.',
            example: 'مثال: النشر 2(x+3) = 2x + 6. التحليل 2x + 6 = 2(x+3).',
            icon: <Microscope size={20} />
        },
        {
            title: 'الطريقة 1: العامل المشترك',
            detail: 'نبحث عن شيء يتكرر في كل الأطراف ونخرجه خارج القوس.',
            math: 'ka + kb = k(a + b)',
            example: 'مثال: 5x + 10 = 5(x + 2) لأن 5 عامل مشترك.',
            icon: <Layers size={20} />
        },
        {
            title: 'الطريقة 2: المتطابقات الشهيرة',
            detail: 'نستخدم المتطابقات بشكل عكسي. أشهرها هي المتطابقة الثالثة.',
            math: 'a² - b² = (a+b)(a-b)',
            example: 'مثال: x² - 16 = (x+4)(x-4).',
            icon: <Sigma size={20} />
        },
        {
            title: 'التحليل المركب',
            detail: 'أحياناً نجد عاملاً مشتركاً عبارة عن قوس كامل.',
            math: '(x+1)(2x+3) + (x+1)(x-2) = (x+1)[(2x+3) + (x-2)]',
            icon: <BrainCircuit size={20} />
        }
    ];

    const challenges = [
        { q: '3x + 12 = 3(x + ?)', a: '4', hint: '12 ÷ 3 = ?' },
        { q: 'x² - 9 = (x + ?)(x - 3)', a: '3', hint: 'ما هو العدد الذي مربعه 9؟' },
        { q: '5x² + 5x = 5x(x + ?)', a: '1', hint: '5x ÷ 5x = ?' },
        { q: 'x² - 25 = (x + 5)(x - ?)', a: '5', hint: 'نفس العدد لكن بإشارة معاكسة.' },
        { q: '4x² - 1 = (2x + ?)(2x - 1)', a: '1', hint: 'الواحد هو 1².' },
        { q: '(x+1)(2x) + (x+1)(3) = (x+1)(?x + 3)', a: '2', hint: 'ما هو معامل x في القوس المتبقي؟' }
    ];

    const handleAnswer = async () => {
        const current = challenges[challengeStep];
        if (userInput.trim() === current.a) {
            setScore(score + 1);
            setFeedback({ type: 'success', text: 'تحليل دقيق وصحيح ✓' });
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            setShowHint(false);
            setUserInput('');

            if (challengeStep < challenges.length - 1) {
                setTimeout(() => {
                    setChallengeStep(challengeStep + 1);
                    setFeedback(null);
                }, 1000);
            } else {
                setIsCompleted(true);
                try {
                    await labProgressService.update('factorization-general', 'completed', 100);
                } catch (err) { console.error(err); }
            }
        } else {
            setFeedback({ type: 'error', text: 'حاول مرة أخرى. ركز في إيجاد العامل المشترك.' });
            setTimeout(() => setFeedback(null), 2000);
        }
    };

    return (
        <div className={`w-full h-full flex flex-col font-sans transition-all duration-500`} dir="rtl">
            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-4 overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                        <motion.button initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onClick={() => { setPhase('learn'); setLearnStep(0); labProgressService.update('factorization-general', 'learn').catch(console.error); }} className={`group relative p-4 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden shadow-2xl ${theme.card}`}>
                             <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white mb-3 shadow-xl transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter ${theme.textMain}`}>موسوعة التحليل</h3>
                             <p className={`${theme.textSub} text-sm md:text-base font-medium leading-relaxed italic`}>استكشف طرق التحليل الجبري، من العامل المشترك إلى المتطابقات الشهيرة والتحليل المركب.</p>
                        </motion.button>
                        <motion.button initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onClick={() => { setPhase('practice'); setChallengeStep(0); setScore(0); setCompleted(false); labProgressService.update('factorization-general', 'practice').catch(console.error); }} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 transition-transform duration-500 group-hover:scale-110`} />
                            <div className="relative p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Rocket size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">بدء التحدي</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-5xl space-y-8">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                             <div className="flex flex-col items-center text-center">
                                 <div className={`w-20 h-20 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 shadow-inner`}>{learnPages[learnStep].icon}</div>
                                 <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                                 <p className={`text-base md:text-lg ${theme.textSub} mb-3 max-w-2xl font-medium leading-relaxed italic`}>{learnPages[learnStep].detail}</p>
                                 {learnPages[learnStep].math && (
                                     <div className={`p-5 rounded-[1.5rem] border-2 bg-white/5 border-white/10 shadow-inner w-full mb-4 flex items-center justify-center`}>
                                         <span className="text-2xl md:text-xl font-mono font-black text-indigo-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]" dir="ltr">{learnPages[learnStep].math}</span>
                                     </div>
                                 )}
                                 <div className={`p-6 rounded-2xl border-2 border-indigo-500/20 bg-indigo-500/5 text-indigo-300 font-black text-lg md:text-2xl italic`}>{learnPages[learnStep].example}</div>
                             </div>
                        </motion.div>
                        <div className="flex gap-3 justify-center">
                             <button onClick={() => learnStep > 0 ? setLearnStep(learnStep - 1) : setPhase('intro')} className={`px-4 py-2 rounded-2xl font-black transition-all ${isDarkMode ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-slate-100 text-slate-600'}`}>السابق</button>
                             {learnStep < learnPages.length - 1 ? (
                                 <button onClick={() => setLearnStep(learnStep + 1)} className="px-12 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-[1rem] font-black shadow-xl transition-all text-2xl active:scale-95 flex items-center gap-4">التالي <ArrowRight size={28} /></button>
                             ) : (
                                 <button onClick={() => setPhase('practice')} className="px-12 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-[1rem] font-black shadow-xl transition-all text-2xl flex items-center gap-4 active:scale-95">تحدي الآن <ZapIcon size={28} /></button>
                             )}
                        </div>
                    </div>
                )}

                {phase === 'practice' && !isCompleted && (
                    <div className="flex flex-col items-center w-full max-w-5xl px-4">
                        <div className={`w-full p-4 md:p-5 rounded-[1.5rem] border-2 backdrop-blur-3xl mb-12 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${theme.card}`}>
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-30" />
                             <div className="absolute top-6 right-10 text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">تحدي {challengeStep + 1} / {challenges.length}</div>
                             <div className="text-xl md:text-9xl font-black text-indigo-400 drop-shadow-[0_0_30px_rgba(129,140,248,0.3)] font-mono" dir="ltr">
                                 {challenges[challengeStep].q}
                             </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-2xl">
                            <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 mb-3 backdrop-blur-3xl shadow-2xl ${theme.card}`}>
                                <div className="flex items-center justify-center gap-3">
                                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`flex-grow bg-white/5 border-4 rounded-[1.5rem] p-6 text-center text-base md:text-lg font-black outline-none transition-all ${error ? 'border-rose-500 animate-shake text-rose-500' : 'border-indigo-500/30 text-indigo-400 focus:border-indigo-400 shadow-inner'}`} placeholder="?" autoFocus />
                                    <button onClick={handleAnswer} className="p-8 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1rem] shadow-xl active:scale-95 transition-all"><Send size={36} /></button>
                                </div>
                                <button onClick={() => setShowHint(!showHint)} className="mt-4 flex items-center gap-3 text-amber-500/60 font-black text-lg hover:text-amber-500 transition-colors mx-auto group">
                                    <HelpCircle size={22} className="group-hover:rotate-12 transition-transform" /> طلب مساعدة برمجية
                                </button>
                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`mt-6 p-6 rounded-3xl border-2 text-center bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold text-xl italic shadow-inner`}>
                                            {challenges[challengeStep].hint}
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

                {isCompleted && (
                    <div className="w-full max-w-4xl text-center px-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-16 md:p-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-4 border-indigo-500/40 rounded-[5rem] shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                            <Trophy size={140} className="mx-auto text-amber-500 mb-3 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-bounce" />
                            <h3 className="text-xl md:text-8xl font-black text-white mb-3 tracking-tighter italic">عبقري التحليل!</h3>
                            <p className="text-indigo-200 text-base md:text-lg font-medium italic leading-relaxed mb-12">لقد تمكنت من فك شيفرة جميع العبارات الجبرية وتحويلها إلى جداء عوامل بنجاح باهر.</p>
                            <div className="bg-white/10 rounded-[1.5rem] p-8 backdrop-blur-sm inline-block border-2 border-white/10 mb-3">
                                <p className="text-xl font-black text-white">{score} / {challenges.length}</p>
                            </div>
                        </motion.div>
                        <button onClick={() => { setPhase('intro'); setChallengeStep(0); setIsCompleted(false); setScore(0); }} className="mt-3 w-full py-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-95">إعادة التحدي</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FactorizationLab() {
    return (
        <LabShell 
            labId="factorization-general" 
            title="مختبر التحليل" 
            icon={Target}
            accentColor="indigo"
            badgeText="مختبر الأبحاث الجبرية"
            badgeIcon={Cpu}
        >
            <FactorizationContent />
        </LabShell>
    );
}
