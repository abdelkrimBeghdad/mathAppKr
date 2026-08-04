import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Send, Lightbulb, Trophy, AlertCircle, RotateCcw, BookOpen, HelpCircle, ArrowRight, Target, Binary, Sigma, Search, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/geometry.js';
import LabShell from './LabShell';
import LabTutorialNote from './LabTutorialNote';
import MasteryRewardCard from './MasteryRewardCard';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'div-discover';

function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function DivisorDiscoveryContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);

    const [factorA, setFactorA] = useState('');
    const [factorB, setFactorB] = useState('');
    const [foundPairs, setFoundPairs] = useState([]);
    const [currentAttempt, setCurrentAttempt] = useState({ factor: 1, status: 'idle' });
    const [feedback, setFeedback] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [showStopChallenge, setShowStopChallenge] = useState(false);
    const [divisors, setDivisors] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [reward, setReward] = useState(null);

    const challenge = rounds[round]; // { level, target, divisors, q, hint }
    const target = challenge.target;

    const learnContent = [
        { title: 'بروتوكول البداية', math: '12 = 1 × 12', detail: 'نبدأ دائماً بالعدد 1 كأول قاسم، ومقابله العدد نفسه.', icon: <Target size={20} /> },
        { title: 'التسلسل المنطقي', math: '12 = 2 × 6', detail: 'ننتقل للعدد 2 ونبحث عن مكمّله بالضرب.', icon: <Binary size={20} /> },
        { title: 'نقطة الانعطاف', math: '12 = 3 × 4', detail: 'نستمر حتى نجد أن العدد التالي (4) قد ظهر مسبقاً، هنا نتوقف.', icon: <RotateCcw size={20} /> },
    ];

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
            .then(p => { if (p) { const lvl = difficultyEngine.getLevel(p); setBaseLevel(lvl); setRounds(buildRounds(lvl)); } })
            .catch(() => { });
    }, []);

    const resetRoundState = () => {
        setFactorA(''); setFactorB(''); setFoundPairs([]);
        setCurrentAttempt({ factor: 1, status: 'idle' });
        setFeedback(null); setIsFinished(false); setShowStopChallenge(false);
        setDivisors([]); setShowHint(false);
    };

    const startPractice = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        resetRoundState();
        setReward(null);
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleCheck = () => {
        const a = parseInt(factorA);
        const b = parseInt(factorB);
        if (isNaN(a) || isNaN(b)) return;

        if (a * b !== target) {
            setFeedback({ type: 'error', text: `الجداء ${a} × ${b} = ${a * b} لا يساوي ${target}. حاول مرة أخرى!` });
            return;
        }
        if (a !== currentAttempt.factor) {
            setFeedback({ type: 'hint', text: `من الأفضل تجربة الأعداد بالتسلسل. لنحاول مع العدد ${currentAttempt.factor}.` });
            return;
        }

        const newPairs = [...foundPairs, { a, b }];
        setFoundPairs(newPairs);
        setFactorA('');
        setFactorB('');
        setShowHint(false);
        setFeedback({ type: 'success', text: `ممتاز! ${a} × ${b} = ${target}. تم اكتشاف زوج جديد!` });

        const nextFactor = currentAttempt.factor + 1;
        checkNextStep(nextFactor, newPairs);
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
    };

    const checkNextStep = (nextA, currentPairs) => {
        const repeated = currentPairs.find(p => p.b === nextA || p.a === nextA);
        if (repeated) {
            setShowStopChallenge(true);
        } else if (target % nextA === 0) {
            setCurrentAttempt({ factor: nextA, status: 'idle' });
        } else {
            const r = target % nextA;
            setFeedback({ type: 'explanation', text: `العدد ${nextA} ليس قاسماً لـ ${target} لأن الباقي (${r}) ليس معدوماً.` });
            checkNextStep(nextA + 1, currentPairs);
        }
    };

    const handleStopDecision = async (decision) => {
        if (decision !== 'stop') {
            setFeedback({ type: 'error', text: 'فكر جيداً! لقد بدأنا نكرر نفس الأعداد التي وجدناها سابقاً.' });
            return;
        }

        setIsFinished(true);
        setShowStopChallenge(false);
        const allDivs = Array.from(new Set(foundPairs.flatMap(p => [p.a, p.b]))).sort((x, y) => x - y);
        setDivisors(allDivs);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

        if (round < 2) {
            // جولة وسيطة — بلا مطالبة مكافأة، ننتقل للجولة التالية
            return;
        }

        await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
        try {
            const data = await rewardService.claimLabReward(LAB_ID, {
                type: 'div-discover', target, divisors: allDivs,
            });
            if (data.status === 'success') setReward(data);
        } catch (err) { console.error(err); }
    };

    const nextRound = () => {
        setRound(r => r + 1);
        resetRoundState();
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base md:text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>خريطة الاكتشاف:</h3>
                <p className={`${theme.textSub} text-sm mb-4 font-medium`}>تعلم استراتيجية "أزواج الضرب" لتحديد جميع القواسم دون نسيان أي منها.</p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black transition-all">بدء الرحلة</button>
            </div>
            <motion.button onClick={startPractice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative group cursor-pointer overflow-hidden rounded-[1rem] shadow-2xl">
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-amber-600 to-orange-900' : 'bg-gradient-to-br from-amber-500 to-amber-600'}`} />
                <div className="relative p-8 flex flex-col items-center justify-center text-center gap-3 text-white">
                    <Search size={36} className="animate-pulse" />
                    <span className="text-xl font-black tracking-tighter uppercase">تفعيل الرادار</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl ${theme.card}`}
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">{learnContent[learnStep].icon}</div>
                        <h3 className={`text-lg font-black ${theme.textMain}`}>{learnContent[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} max-w-lg font-medium leading-relaxed`}>{learnContent[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-amber-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-amber-50'}`}>
                            <span className="font-mono font-black text-amber-400" dir="ltr">{learnContent[learnStep].math}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>السابق</button>
                {learnStep < learnContent.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">ابدأ البحث <Search size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col items-center w-full max-w-5xl px-2">
            <div className={`mb-4 inline-flex items-center gap-2 px-5 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border ${isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                <Cpu size={14} /> الجولة {round + 1}/3 — مستوى {['', 'مبتدئ', 'متوسط', 'متقدم'][challenge.level]}
            </div>
            <h2 className={`text-xl font-black tracking-tighter leading-none px-4 mb-6 ${theme.textMain}`}>
                {isFinished ? 'تم استخراج القواسم بنجاح!' : `أوجد قواسم العدد (${target})`}
            </h2>

            {!isFinished && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-8" dir="ltr">
                        <AnimatePresence>
                            {foundPairs.map((pair, i) => (
                                <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-3 text-center font-black text-lg text-amber-500">
                                    {pair.a} × {pair.b} = {target}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {!showStopChallenge ? (
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-2xl p-5 rounded-[1.5rem] border-2 border-white/5 mb-4 backdrop-blur-3xl ${theme.card}`}>
                            <div className="text-center mb-4">
                                <div className="text-amber-500 font-black mb-2 text-sm uppercase tracking-widest">المحاولة الحالية:</div>
                                <div className={`text-base font-black font-mono ${theme.textMain}`} dir="ltr">{target} = {currentAttempt.factor} × ?</div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 justify-center" dir="ltr">
                                <input type="number" value={factorA} onChange={(e) => setFactorA(e.target.value)} placeholder="?" aria-label="العامل الأول" className={`w-20 md:w-24 rounded-xl p-3 text-center font-black outline-none border-2 ${isDarkMode ? 'bg-slate-950 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} />
                                <Sigma className="opacity-30" size={18} />
                                <input type="number" value={factorB} onChange={(e) => setFactorB(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} placeholder="?" aria-label="العامل الثاني" className={`w-20 md:w-24 rounded-xl p-3 text-center font-black outline-none border-2 ${isDarkMode ? 'bg-slate-950 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} />
                                <button onClick={handleCheck} aria-label="تحقق" className="p-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-white transition-all"><Send size={18} className="rotate-180" /></button>
                            </div>

                            <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-amber-500/60 font-black text-xs mx-auto mt-4 hover:text-amber-500 transition-colors uppercase">
                                <HelpCircle size={14} /> تلميح استكشافي
                            </button>
                            <AnimatePresence>
                                {showHint && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl text-center font-black text-sm text-amber-400" dir="ltr">
                                        {target % currentAttempt.factor === 0 ? `${target} ÷ ${currentAttempt.factor} = ${target / currentAttempt.factor}` : `${target} لا يقبل القسمة على ${currentAttempt.factor}`}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <LabTutorialNote
                                from={`نبحث عن جميع الأزواج (a, b) بحيث a × b = ${target}.`}
                                why="نبدأ من 1 ونتصاعد بالتسلسل لأن كل عدد إما أن يكون قاسماً أو لا؛ عندما يبدأ العدد الحالي بالتطابق مع عدد وجدناه مسبقاً في الطرف الآخر، نكون قد جمعنا كل القواسم الممكنة ولا داعي للمتابعة."
                            />
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`w-full max-w-2xl p-8 rounded-[1.5rem] border-2 border-rose-500/40 text-center backdrop-blur-3xl ${theme.card}`}>
                            <AlertCircle size={20} className="mx-auto text-rose-500 mb-4 animate-pulse" />
                            <h3 className={`text-lg font-black mb-3 ${theme.textMain}`}>تحذير: تكرار البيانات!</h3>
                            <p className={`text-sm mb-4 font-medium leading-relaxed ${theme.textSub}`}>لقد بدأت الأرقام بالتكرار في الاتجاه المعاكس. هل تعتقد أننا وجدنا جميع القواسم الممكنة؟</p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <button onClick={() => handleStopDecision('stop')} className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black transition-all">نعم، نتوقف هنا</button>
                                <button onClick={() => handleStopDecision('continue')} className="px-6 py-3 bg-slate-800 text-slate-300 rounded-2xl font-black transition-all border border-white/5">لا، واصل البحث</button>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {feedback && (
                            <motion.div key={feedback.text} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`mt-4 p-4 rounded-2xl border-2 flex items-center gap-3 w-full max-w-2xl ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                                {feedback.type === 'success' ? <Trophy size={18} /> : <Lightbulb size={18} />}
                                <p className="font-black text-sm">{feedback.text}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {isFinished && (
                <div className="w-full max-w-2xl text-center px-2">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`border-4 rounded-[1.5rem] p-8 mb-3 backdrop-blur-3xl relative overflow-hidden ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white border-emerald-500 shadow-2xl'}`}>
                        <Check size={32} className="mx-auto text-emerald-500 mb-3" />
                        <h3 className={`text-lg font-black mb-3 tracking-tighter ${theme.textMain}`}>{round < 2 ? 'أحسنت! جولة جديدة قادمة' : 'مُنقب القواسم الخبير'}</h3>
                        <div className={`p-5 rounded-2xl border-2 border-emerald-500/20 mb-3 ${isDarkMode ? 'bg-black/40' : 'bg-slate-50'}`}>
                            <div className="text-emerald-400 font-mono font-black tracking-tighter text-sm md:text-base" dir="ltr">
                                {"{ " + divisors.join(", ") + " }"}
                            </div>
                        </div>
                    </motion.div>
                    {round < 2 ? (
                        <button onClick={nextRound} className="mt-2 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black transition-all">الجولة التالية</button>
                    ) : (
                        <>
                            <MasteryRewardCard reward={reward} />
                            <button onClick={() => { setPhase('intro'); }} className="mt-4 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black transition-all">استكشاف عدد آخر</button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default function DivisorDiscovery() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="اكتشاف القواسم"
            badgeText="بروتوكول التنقيب عن القواسم"
            badgeIcon={Search}
            accentColor="amber"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <DivisorDiscoveryContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
