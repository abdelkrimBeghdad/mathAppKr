import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lightbulb, Send, BookOpen, RotateCcw, Cpu, Binary, Zap as ZapIcon, RefreshCw, Target, Sigma } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import MathText from '../MathText';

const LEARN_PAGES = [
    { title: 'مربع عدد', math: 'مربع عدد هو دائماً عدد موجب. \\n لكل عدد موجب $a$ يوجد عددان متعاكسان مربعهما يساوي $a$.', detail: 'مثال: $(4)^2 = 16$ و $(-4)^2 = 16$.', color: 'indigo' },
    { title: 'تعريف الجذر التربيعي', math: 'الجذر التربيعي للعدد الموجب $a$ هو العدد الموجب الذي مربعه يساوي $a$، ونرمز له بـ $\\sqrt{a}$.', detail: 'مثال: $\\sqrt{9} = 3$ لأن $3^2 = 9$.', color: 'emerald' },
    { title: 'خاصية هامة', math: 'من أجل كل عدد موجب $a$: \\n $(\\sqrt{a})^2 = a$ أو $\\sqrt{a^2} = a$', detail: 'مثال: $(\\sqrt{11})^2 = 11$.', color: 'rose' },
    { title: 'قواعد الحساب', math: '$\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}$ \\n $\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}$', detail: 'مثال: $\\sqrt{100} = \\sqrt{4 \\times 25} = 10$.', color: 'amber' }
];

const CHALLENGES = [
    { q: '\\sqrt{36}', steps: [{ prompt: 'ما هو العدد الموجب الذي تربيعه $36$؟', a: '6', hint: '$6 \\times 6 = 36$' }], final: '6' },
    { q: '(\\sqrt{25})^2', steps: [{ prompt: 'طبق القاعدة مباشرة: $(\\sqrt{a})^2 = a$.', a: '25', hint: 'الجذر والتربيع يلغيان بعضهما.' }], final: '25' },
    { q: '\\sqrt{8^2}', steps: [{ prompt: 'طبق القاعدة: \\sqrt{a^2} = a.', a: '8', hint: 'التربيع تحت الجذر يخرج القيمة الموجبة.' }], final: '8' },
    { q: '\\sqrt{50}', steps: [
        { prompt: 'فكك العدد $50$ لجداء عددين أحدهما مربع تام: $50 = ? \\times 2$', a: '25', hint: 'المربعات التامة: $4, 9, 16, 25...$' },
        { prompt: 'الآن أحسب: $\\sqrt{25} \\times \\sqrt{2} = ? \\sqrt{2}$', a: '5', hint: 'كم يساوي الجذر التربيعي لـ $25$؟', full: '5\\sqrt{2}' }
    ], final: '5\\sqrt{2}' }
];

function RootsContent() {
    const { theme, isDarkMode, currentAccent } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeIndex, setChallengeIndex] = useState(0);
    const [subStepIndex, setSubStepIndex] = useState(0);
    const [userInputs, setUserInputs] = useState(['', '', '']);
    const [feedback, setFeedback] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('roots-foundation')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const currentChallenge = CHALLENGES[challengeIndex];
    const currentStep = currentChallenge?.steps[subStepIndex];

    const normalizeAnswer = (str) => {
        if (!str) return '';
        return str.toString().replace(/\\sqrt/g, '√').replace(/\{|\}/g, '').replace(/\s+/g, '').replace(/\\times/g, '×').replace(/\*/g, '×');
    };

    const handleAnswerSubmission = async () => {
        const input = normalizeAnswer(userInputs[subStepIndex]);
        const expected = normalizeAnswer(currentStep.a);
        const isFullExpressionMatch = input === normalizeAnswer(currentStep.full || currentStep.a);
        
        if (input === expected || isFullExpressionMatch) {
            setFeedback({ type: 'success', text: 'تم فك التشفير بنجاح ✓' });
            setShowHint(false);
            if (subStepIndex < currentChallenge.steps.length - 1) {
                setTimeout(() => { setSubStepIndex(prev => prev + 1); setFeedback(null); }, 800);
            } else {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                if (challengeIndex < CHALLENGES.length - 1) {
                    setTimeout(() => { setChallengeIndex(prev => prev + 1); setSubStepIndex(0); setUserInputs(['', '', '']); setFeedback(null); }, 1500);
                } else {
                    setIsCompleted(true);
                    try {
                        await labProgressService.update('roots-foundation', 'completed', 100);
                    } catch (err) { console.error(err); }
                }
            }
        } else {
            setFeedback({ type: 'error', text: 'تحليل غير دقيق! حاول مجدداً.' });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    return (
        <div className={`w-full h-full flex flex-col font-sans transition-all duration-500`} dir="rtl">
            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-4 overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                        <motion.button onClick={() => { setPhase('learn'); setLearnStep(0); labProgressService.update('roots-foundation', 'learn').catch(console.error); }} className={`group relative p-4 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden shadow-2xl ${theme.card}`}>
                             <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-white mb-3 shadow-xl transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter ${theme.textMain}`}>أكاديمية الجذور</h3>
                             <p className={`${theme.textSub} text-sm md:text-base font-medium leading-relaxed italic`}>استكشف تعريف الجذر التربيعي وقواعد الحساب الأساسية في مختبرنا المتقدم.</p>
                        </motion.button>
                        <motion.button onClick={() => { setPhase('practice'); setChallengeIndex(0); setSubStepIndex(0); labProgressService.update('roots-foundation', 'practice').catch(console.error); }} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                            <div className={`absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 transition-transform duration-500 group-hover:scale-110`} />
                            <div className="relative p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <ZapIcon size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">بدء التحدي</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-5xl space-y-8">
                        <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-4 md:p-6 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl relative overflow-hidden ${theme.card}`}>
                            <div className={`text-sm font-black text-emerald-400 mb-4 uppercase tracking-[0.3em]`}>{LEARN_PAGES[learnStep].title}</div>
                            <div className="space-y-10">
                                <div className={`p-5 rounded-[1.5rem] border-2 bg-white/5 border-white/10 shadow-inner flex items-center justify-center`}>
                                    <MathText text={LEARN_PAGES[learnStep].math} className={`text-2xl md:text-xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]`} />
                                </div>
                                <div className={`p-8 rounded-[1.5rem] border-2 border-emerald-500/20 bg-emerald-500/5 text-center`}>
                                    <MathText text={LEARN_PAGES[learnStep].detail} className={`text-base md:text-lg text-white/80 italic`} />
                                </div>
                            </div>
                        </motion.div>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => learnStep < LEARN_PAGES.length - 1 ? setLearnStep(prev => prev + 1) : setPhase('practice')} className="flex-grow py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-95">
                                {learnStep < LEARN_PAGES.length - 1 ? 'الخطوة التالية \u2190' : 'بدء التحدي العلمي'}
                            </button>
                            <button onClick={() => setLearnStep(0)} className={`p-8 rounded-[1.5rem] border-2 transition-all ${isDarkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-500 shadow-xl'}`}><RefreshCw size={20} /></button>
                        </div>
                    </div>
                )}

                {phase === 'practice' && !isCompleted && (
                    <div className="w-full max-w-5xl flex flex-col items-center px-4">
                        <div className={`w-full p-4 md:p-5 rounded-[1.5rem] border-2 backdrop-blur-3xl mb-12 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${theme.card}`}>
                             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-30" />
                             <div className="absolute top-6 right-10 text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">سؤال {challengeIndex + 1} / {CHALLENGES.length}</div>
                            <div className={`text-8xl md:text-[14rem] font-black mb-12 drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] text-white`}>
                                <MathText text={`$${currentChallenge.q}$`} />
                            </div>
                            <div className="p-8 rounded-[1.5rem] border-2 bg-white/5 border-white/10 shadow-inner mb-3">
                                <MathText text={currentStep.prompt} className="text-base md:text-lg font-black text-white/80 italic" />
                            </div>
                            <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto w-full">
                                <input type="text" value={userInputs[subStepIndex]} onChange={(e) => { const n = [...userInputs]; n[subStepIndex] = e.target.value; setUserInputs(n); }} onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmission()} className={`flex-grow bg-white/5 border-4 rounded-[1.5rem] py-3 text-center text-base md:text-lg font-black font-mono outline-none transition-all ${feedback?.type === 'error' ? 'border-rose-500 animate-shake text-rose-500' : 'border-emerald-500/30 text-emerald-400 focus:border-emerald-500 shadow-inner'}`} placeholder="?" autoFocus />
                                <button onClick={handleAnswerSubmission} className="p-8 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[1rem] shadow-xl active:scale-95 transition-all"><Send size={36} /></button>
                            </div>
                        </div>
                        <button onClick={() => setShowHint(!showHint)} className="text-amber-500 font-black text-xl flex items-center gap-3 hover:text-amber-400 transition-colors group">
                            <Lightbulb className="group-hover:rotate-12 transition-transform" /> {showHint ? 'إخفاء التلميح' : 'تلميح ذكي'}
                        </button>
                        <AnimatePresence>
                            {showHint && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 p-6 bg-amber-500/10 border-2 border-amber-500/20 rounded-3xl text-amber-400 font-bold text-xl italic shadow-inner">
                                    {currentStep.hint}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <AnimatePresence>
                            {feedback && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-4 px-10 py-5 rounded-2xl border-2 font-black text-xl shadow-lg ${feedback.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'}`}>
                                    {feedback.text}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {isCompleted && (
                    <div className="w-full max-w-4xl text-center px-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-16 md:p-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-4 border-emerald-500/40 rounded-[5rem] shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                            <Trophy size={140} className="mx-auto text-amber-500 mb-3 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-bounce" />
                            <h3 className="text-xl md:text-8xl font-black text-white mb-3 tracking-tighter italic">سيد الجذور!</h3>
                            <p className="text-emerald-200 text-base md:text-lg font-medium italic leading-relaxed mb-12">لقد أتقنت القواعد الأساسية للجذور التربيعية في مختبرنا المتقدم.</p>
                            <button onClick={() => { setPhase('intro'); setIsCompleted(false); setChallengeIndex(0); setSubStepIndex(0); setUserInputs(['', '', '']); }} className="w-full py-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-95">تكرار الاختبار</button>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RootsLab() {
    return (
        <LabShell 
            labId="roots-foundation" 
            title="مختبر التحليل الجذري" 
            icon={Cpu}
            accentColor="emerald"
            badgeText="أكاديمية الجذور"
            badgeIcon={Target}
        >
            <RootsContent />
        </LabShell>
    );
}
