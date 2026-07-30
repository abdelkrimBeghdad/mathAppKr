import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => {
        const params = difficultyEngine.getParams('expansion', lvl);
        const maxB = params.maxCoeff || 9;
        const b = Math.floor(Math.random() * maxB) + 1;
        return { level: lvl, b };
    });
}

function ExpansionIdentity1Content({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(1); // 1: تحديد x، 2: تحديد b، 3: إدخال، 4: تم
    const [inputs, setInputs] = useState({ mid: '', last: '' });
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const problem = roundData; // { level, b }

    useEffect(() => {
        labProgressService.getOne('id1')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const learnPages = [
        { title: 'بروتوكول مربع المجموع', detail: 'المتطابقة الأولى تمكننا من نشر مربع مجموع حدين مباشرة دون الحاجة للنشر المزدوج التقليدي.', math: '(a + b)² = a² + 2ab + b²', icon: <Star size={20} /> },
        { title: 'قانون الحدود الثلاثة', detail: 'النتيجة دائماً تتكون من: مربع الأول، زائد ضعف الأول في الثاني، زائد مربع الثاني.', math: '2 × a × b ⟶ الحد الأوسط', icon: <Layers size={20} /> },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(1);
        setInputs({ mid: '', last: '' });
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('id1', 'practice').catch(() => { });
    };

    const handleTermClick = (term) => {
        if (step === 1 && term === 'a') setStep(2);
        if (step === 2 && term === 'b') setStep(3);
    };

    const checkMastery = async () => {
        const correctMid = 2 * problem.b;
        const correctLast = problem.b * problem.b;
        if (parseInt(inputs.mid) === correctMid && parseInt(inputs.last) === correctLast) {
            setStep(4);
            setError(false);
            if (round < 2) {
                setFeedback({ type: 'success', text: `نشر مثالي! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => {
                    setRound(r => r + 1);
                    setStep(1);
                    setInputs({ mid: '', last: '' });
                    setFeedback(null);
                }, 1600);
            } else {
                setFeedback({ type: 'success', text: 'نشر مثالي! طبّقت المتطابقة بدقة.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('id1', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('id1', {
                        type: 'identity-sum-sq', b: problem.b, midTerm: correctMid, lastTerm: correctLast,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: الحد الأوسط = 2×a×b، والأخير = b².' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>القاعدة الهيكلية:</h3>
                <div className={`p-4 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-50 border-indigo-100'}`}>
                    <span className="font-mono font-black text-indigo-400 text-sm" dir="ltr">(a + b)² = a² + 2ab + b²</span>
                </div>
                <p className={`text-xs ${theme.textSub} mt-2 text-center`}>ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.</p>
                <div className={`mt-2 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}>
                    عرض بروتوكول النشر
                </button>
            </div>
            <motion.button onClick={startPractice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Star size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">تفعيل المتطابقة</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">{learnPages[learnStep].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <span className="font-mono font-black text-indigo-400" dir="ltr">{learnPages[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">دخول التجربة</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="visual"
            current={round + 1}
            total={3}
            level={roundData.level}
            hint="اضغط على x أولاً، ثم على الرقم الثاني، لتظهر خطوة الإدخال."
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(1); setInputs({ mid: '', last: '' }); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="flex items-center justify-center font-mono font-black text-lg gap-1" dir="ltr">
                    <span className={`opacity-40 ${theme.textMain}`}>(</span>
                    <motion.div
                        onClick={() => handleTermClick('a')}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 1 && (e.preventDefault(), handleTermClick('a'))}
                        role="button" tabIndex={step === 1 ? 0 : -1} aria-label="اضغط على x للمتابعة"
                        whileTap={step === 1 ? { scale: 0.9 } : {}}
                        className={`px-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${step === 1 ? 'cursor-pointer' : ''} ${step >= 2 ? 'text-sky-400 bg-sky-500/10' : step === 1 ? `${theme.textMain} bg-white/5 border-2 border-white/20 animate-pulse` : 'opacity-20'
                            }`}
                    >x</motion.div>
                    <span className={`opacity-40 ${theme.textMain}`}>+</span>
                    <motion.div
                        onClick={() => handleTermClick('b')}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 2 && (e.preventDefault(), handleTermClick('b'))}
                        role="button" tabIndex={step === 2 ? 0 : -1} aria-label={`اضغط على ${problem.b} للمتابعة`}
                        whileTap={step === 2 ? { scale: 0.9 } : {}}
                        className={`px-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${step === 2 ? 'cursor-pointer' : ''} ${step >= 3 ? 'text-indigo-400 bg-indigo-500/10' : step === 2 ? `${theme.textMain} bg-white/5 border-2 border-white/20 animate-pulse` : 'opacity-20'
                            }`}
                    >{problem.b}</motion.div>
                    <div className="relative">
                        <span className={`opacity-40 ${theme.textMain}`}>)</span>
                        <span className="text-indigo-400 absolute -top-3 -right-3 text-xs">2</span>
                    </div>
                </div>

                <AnimatePresence>
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 w-full">
                            <div className="flex flex-wrap items-center justify-center gap-2 font-mono font-black text-base" dir="ltr">
                                <div className="relative text-sky-400">x<span className="absolute -top-3 -right-3 text-xs">2</span></div>
                                <span className={`opacity-40 ${theme.textMain}`}>+</span>
                                <input type="number" value={inputs.mid} onChange={e => setInputs({ ...inputs, mid: e.target.value })} aria-label="الحد الأوسط" autoFocus
                                    className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400' : 'bg-white border-indigo-200 text-indigo-700'}`} placeholder="؟" />
                                <span className={`italic opacity-40 ${theme.textMain}`}>x</span>
                                <span className={`opacity-40 ${theme.textMain}`}>+</span>
                                <input type="number" value={inputs.last} onChange={e => setInputs({ ...inputs, last: e.target.value })} onKeyDown={e => e.key === 'Enter' && checkMastery()} aria-label="الحد الأخير"
                                    className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="؟" />
                            </div>
                            <LabTutorialNote
                                from={`الحد الثاني في القوس هو ${problem.b}.`}
                                why={`القانون ثابت دائماً: الحد الأوسط = ضعف حاصل ضرب الحدين (2×1×${problem.b}=${2 * problem.b})، والحد الأخير = مربع الحد الثاني (${problem.b}²=${problem.b * problem.b}).`}
                            />
                            <button onClick={checkMastery} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center gap-2 transition-all">
                                <CheckCircle2 size={18} /> تأكيد الهيكلية
                            </button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-2xl border-2 font-mono font-black flex items-center gap-3 flex-wrap justify-center ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}
                            dir="ltr"
                        >
                            <div className="relative text-sky-400">x<span className="absolute -top-3 -right-3 text-xs">2</span></div>
                            <span className={`opacity-40 ${theme.textMain}`}>+</span>
                            <span className="text-indigo-400">{2 * problem.b}x</span>
                            <span className={`opacity-40 ${theme.textMain}`}>+</span>
                            <span className="text-emerald-400">{problem.b * problem.b}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LabChallenge>
    );
}

export default function ExpansionIdentity1Lab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="id1"
            phase={phase}
            title="نشر مربع المجموع"
            badgeText="المتطابقة الشهيرة #1"
            badgeIcon={Star}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <ExpansionIdentity1Content phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
