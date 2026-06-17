import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, BookOpen, Zap, Sigma, Cpu, Binary, Target, Send, HelpCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';

function RationalRootsContent() {
    const { theme, isDarkMode, currentAccent } = useLabTheme();
    const [phase, setPhase] = useState('intro'); // intro | learn | practice
    const [learnStep, setLearnStep] = useState(0);
    const [challengeStep, setChallengeStep] = useState(0);
    const [currentSubStep, setCurrentSubStep] = useState(0);
    const [userInputs, setUserInputs] = useState(['', '', '']);
    const [error, setError] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        labProgressService.getOne('rational-roots')
            .then(progress => {
                const level = difficultyEngine.getLevel(progress);
                setDifficultyLevel(level);
            })
            .catch(err => console.error(err));
    }, []);

    const learnPages = [
        {
            title: 'الجذر التربيعي والعدد الناطق',
            math: 'يكون الـعدد √a عدداً ناطقاً إذا كان a هـو مـربع لـعدد ناطق.',
            detail: 'مثال: 121 = 11² \n إذن √121 = 11 هو عدد ناطق.',
            example: 'أيضاً: 25/9 هو مربع لـ 5/3 \n إذن √(25/9) = 5/3 هو عدد ناطق.',
            color: 'emerald'
        },
        {
            title: 'الجزر التربيعي والعدد غير الناطق',
            math: 'إذا كان a لـيس مـربعاً لعدد ناطق، فإن √a لـيس عدداً ناطقاً.',
            detail: 'مثال: العدد 5 ليس مربعاً لأي عدد ناطق.',
            example: 'إذن √5 لـيس عدداً ناطقاً (يسمى عدداً أصماً).',
            color: 'rose'
        }
    ];

    const challenges = [
        {
            q: '√81',
            steps: [
                { prompt: 'العدد 81 هو مربع لأي عدد؟', a: '9', hint: '9 × 9 = 81.' },
                { prompt: 'هل √81 هو عدد ناطق؟ (نعم / لا)', a: 'نعم', hint: 'إذا وجدنا عدداً ناطقاً مربعه هو 81 فهو ناطق.' }
            ]
        },
        {
            q: '√(16/49)',
            steps: [
                { prompt: 'قيمة √16 هي؟', a: '4', hint: '4 × 4 = 16.' },
                { prompt: 'قيمة √49 هي؟', a: '7', hint: '7 × 7 = 49.' },
                { prompt: 'إذن هل √(16/49) عدد ناطق؟', a: 'نعم', hint: 'الكسور هي أعداد ناطقة.' }
            ]
        },
        {
            q: '√7',
            steps: [
                { prompt: 'هل توجد قيمة طبيعية أو كسر مربعه يساوي 7؟ (لا / نعم)', a: 'لا', hint: 'جرب 2² = 4 و 3² = 9. لا يوجد عدد بينهما مربعه 7.' },
                { prompt: 'إذن، هل √7 عدد ناطق؟', a: 'لا', hint: 'راجع القاعدة الثانية في مرحلة التعلم.' }
            ]
        }
    ];

    const currentChallenge = challenges[challengeStep];
    const currentStep = currentChallenge.steps[currentSubStep];

    const handleAnswer = async () => {
        const input = userInputs[currentSubStep].trim().toLowerCase();
        if (input === currentStep.a.toLowerCase()) {
            if (currentSubStep < currentChallenge.steps.length - 1) {
                setCurrentSubStep(currentSubStep + 1);
            } else {
                handleChallengeSuccess();
            }
            setError(false);
            setShowHint(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };

    const handleChallengeSuccess = async () => {
        if (challengeStep < challenges.length - 1) {
            setChallengeStep(challengeStep + 1);
            setCurrentSubStep(0);
            setUserInputs(['', '', '']);
            confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
        } else {
            setPhase('mastery');
            setIsCompleted(true);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            try {
                await labProgressService.update('rational-roots', 'completed', 100);
            } catch (err) { console.error(err); }
        }
    };

    return (
        <div className={`w-full h-full flex flex-col font-sans transition-all duration-500`} dir="rtl">
            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full px-4 overflow-hidden">
                {phase === 'intro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                        <motion.button initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onClick={() => { setPhase('learn'); labProgressService.update('rational-roots', 'learn').catch(console.error); }} className={`group relative p-4 md:p-6 rounded-[1.5rem] text-right transition-all border backdrop-blur-3xl overflow-hidden shadow-2xl ${theme.card}`}>
                             <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center text-white mb-3 shadow-xl transition-transform group-hover:rotate-12"><BookOpen size={20} /></div>
                             <h3 className={`text-base md:text-lg font-black mb-4 tracking-tighter ${theme.textMain}`}>تعلّم القواعد</h3>
                             <p className={`${theme.textSub} text-sm md:text-base font-medium leading-relaxed italic`}>اكتشف الفرق الجوهري بين الأعداد الناطقة والصماء تحت الجذر بوضوح بصرى.</p>
                        </motion.button>
                        <motion.button initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onClick={() => { setPhase('practice'); setChallengeStep(0); setCurrentSubStep(0); labProgressService.update('rational-roots', 'practice').catch(console.error); }} className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] shadow-2xl">
                            <div className={`absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 transition-transform duration-500 group-hover:scale-110`} />
                            <div className="relative p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4 text-white">
                                <Zap size={40} className="md:w-12 md:h-12 animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                                <span className="text-base md:text-lg font-black tracking-tighter uppercase italic tracking-widest">بدء الاختبار</span>
                            </div>
                        </motion.button>
                    </div>
                )}

                {phase === 'learn' && (
                    <div className="w-full max-w-6xl space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {learnPages.map((page, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className={`p-5 rounded-[1.5rem] border-2 transition-all duration-500 shadow-2xl backdrop-blur-3xl ${theme.card}`}>
                                    <div className={`text-sm font-black uppercase tracking-[0.2em] mb-3 ${page.color === 'emerald' ? 'text-emerald-400' : 'text-rose-400'}`}>{page.title}</div>
                                    <div className={`text-xl md:text-2xl font-black mb-4 ${theme.textMain} leading-tight`}>{page.math}</div>
                                    <div className={`p-8 rounded-3xl border-2 bg-white/5 border-white/10 text-white/80 whitespace-pre-line font-medium text-lg leading-relaxed mb-4 shadow-inner italic`}>
                                        {page.detail}
                                    </div>
                                    <div className={`p-6 rounded-2xl border-2 font-black text-lg ${page.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                        {page.example}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <button onClick={() => setPhase('practice')} className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-95">انتقال إلى التحدي</button>
                    </div>
                )}

                {phase === 'practice' && (
                    <div className="flex flex-col items-center w-full max-w-5xl px-4">
                        <div className={`w-full p-4 md:p-5 rounded-[1.5rem] border-2 backdrop-blur-3xl mb-12 text-center relative overflow-hidden transition-all duration-700 shadow-2xl ${theme.card}`}>
                             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-30" />
                            <div className="absolute top-6 right-10 text-xs font-black text-amber-500 uppercase tracking-[0.3em]">تحدي {challengeStep + 1}</div>
                            <div className={`text-8xl md:text-[14rem] font-black font-mono drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] text-white`}>
                                {currentChallenge.q}
                            </div>
                        </div>

                        <motion.div key={currentSubStep} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center max-w-2xl">
                            <div className={`p-4 md:p-6 rounded-[1.5rem] border-2 mb-3 backdrop-blur-3xl shadow-2xl ${theme.card}`}>
                                <p className={`text-base md:text-lg font-black mb-3 leading-tight ${theme.textMain} italic`}>{currentStep.prompt}</p>
                                <div className="flex items-center gap-3">
                                    <input type="text" value={userInputs[currentSubStep]} onChange={(e) => {
                                        const newInputs = [...userInputs];
                                        newInputs[currentSubStep] = e.target.value;
                                        setUserInputs(newInputs);
                                    }} onKeyDown={(e) => e.key === 'Enter' && handleAnswer()} className={`flex-grow bg-white/5 border-4 rounded-[1.5rem] text-center py-3 outline-none text-base md:text-lg font-black transition-all ${error ? 'border-rose-500 animate-shake text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-amber-500/30 text-amber-400 focus:border-amber-500 shadow-inner'}`} placeholder="..." autoFocus />
                                    <button onClick={handleAnswer} className="p-8 bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-[1rem] shadow-xl active:scale-95 transition-all"><Send size={36} /></button>
                                </div>
                                <button onClick={() => setShowHint(!showHint)} className="mt-4 flex items-center gap-3 text-amber-500/60 font-black text-lg hover:text-amber-500 transition-colors mx-auto group">
                                    <HelpCircle size={20} className="group-hover:rotate-12 transition-transform" /> {showHint ? 'إخفاء التلميح' : 'أحتاج تلميحاً ذكياً'}
                                </button>
                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 p-6 bg-amber-500/10 rounded-3xl border-2 border-amber-500/20 text-amber-400 font-bold text-lg italic shadow-inner">
                                            {currentStep.hint}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}

                {phase === 'mastery' && (
                    <div className="flex flex-col items-center w-full max-w-4xl text-center px-4">
                        <Trophy size={140} className="text-amber-500 mb-3 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-bounce" />
                        <div className={`p-16 rounded-[5rem] border-4 border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 mb-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden`}>
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                             <h3 className="relative z-10 text-xl md:text-8xl font-black text-white mb-3 tracking-tighter italic">عبقري التصنيف!</h3>
                             <p className="relative z-10 text-amber-200 text-base md:text-lg font-medium italic leading-relaxed">لقد ميزت بين الأعداد الناطقة والصماء بمهارة عالية في عالم الجذور.</p>
                        </div>
                        <button onClick={() => { setPhase('practice'); setChallengeStep(0); setCurrentSubStep(0); setUserInputs(['', '', '']); setIsCompleted(false); }} className="mt-4 w-full py-10 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-[1.5rem] font-black text-xl shadow-xl transition-all active:scale-95">إعادة التحدي</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RationalRootsLab() {
    return (
        <LabShell 
            labId="rational-roots" 
            title="الأعداد الناطقة والصماء" 
            icon={Target}
            accentColor="amber"
            badgeText="بروتوكول تصنيف الأعداد"
            badgeIcon={Target}
        >
            <RationalRootsContent />
        </LabShell>
    );
}
