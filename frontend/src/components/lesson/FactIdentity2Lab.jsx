import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Binary, ArrowDown, MinusCircle, Microscope } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => {
        const params = difficultyEngine.getParams('expansion', lvl);
        const maxB = params.maxCoeff || 9;
        const a = Math.floor(Math.random() * maxB) + 2;
        return { level: lvl, a };
    });
}

function FactIdentity2Content({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(1); // 1:x² 2:b² 3:mid 4:input 5:done
    const [inputA, setInputA] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const problem = roundData; // { level, a }

    useEffect(() => {
        labProgressService.getOne('fact-id2')
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
        {
            title: 'بروتوكول استعادة الفرق المربع',
            detail: 'التحليل بالمتطابقة الثانية هو استرجاع صيغة مربع الفرق — نتعرف عليها من الإشارة السالبة قبل الحد الأوسط.',
            math: 'a² - 2ab + b² = (a - b)²',
            icon: <MinusCircle size={20} />,
        },
        {
            title: 'خوارزمية القطب السالب',
            detail: 'الجذور تُستخرج بنفس طريقة المتطابقة الأولى، لكن الفرق الجوهري في الإشارة التي تفصل بينهما داخل القوس.',
            math: '√(a²) - √(b²) → (a - b)',
            icon: <Binary size={20} />,
        },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(1);
        setInputA('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('fact-id2', 'practice').catch(() => { });
    };

    const handleFirstTermClick = () => { if (step === 1) setStep(2); };
    const handleLastTermClick = () => { if (step === 2) setStep(3); };
    const handleMiddleTermClick = () => { if (step === 3) setStep(4); };

    const checkMastery = async () => {
        if (parseInt(inputA) === problem.a) {
            setStep(5);
            setError(false);
            if (round < 2) {
                setFeedback({ type: 'success', text: `تمت استعادة مربع الفرق بنجاح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                setTimeout(() => {
                    setRound(r => r + 1);
                    setStep(1);
                    setInputA('');
                    setFeedback(null);
                }, 1600);
            } else {
                setFeedback({ type: 'success', text: 'تمت استعادة مربع الفرق بنجاح!' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('fact-id2', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('fact-id2', {
                        type: 'identity-diff-sq', b: problem.a, midTerm: 2 * problem.a, lastTerm: problem.a * problem.a,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'تحقق من الجذر التربيعي للحد الأخير.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1500);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>قانون الفرق المربع:</h3>
                <div className={`p-4 rounded-xl border font-mono text-center text-sm text-cyan-400 mb-4 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-cyan-50 border-cyan-100'}`}>
                    a² - 2ab + b² = (a - b)²
                </div>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-50 text-cyan-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100'}`}
                >
                    مراجعة خوارزمية القطب السالب
                </button>
            </div>
            <motion.button
                onClick={startPractice}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-rose-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                    <MinusCircle size={40} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء الاستعادة</span>
                </div>
            </motion.button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={learnStep}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-3xl ${theme.card}`}
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                            {learnPages[learnStep].icon}
                        </div>
                        <h3 className={`text-lg font-black ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-rose-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-rose-50'}`}>
                            <span className="font-mono font-black text-rose-400" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button
                    onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    السابق
                </button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black">التالي</button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">دخول المختبر</button>
                }
            </div>
        </div>
    );

    // ── practice ──────────────────────────────────────────────────────────────
    return (
        <LabChallenge
            type="visual"
            current={round + 1}
            total={3}
            level={roundData.level}
            hint="انتبه للإشارة السالبة — الحد الأوسط سالب هو علامة مربع الفرق."
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(1); setInputA(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">

                {/* تعليمة الخطوة */}
                <p className={`text-[11px] uppercase tracking-widest font-black text-center ${theme.textSub}`}>
                    {step === 1 && 'اضغط على x² لاستخراج جذره'}
                    {step === 2 && `اضغط على ${problem.a * problem.a} لاستخراج جذره`}
                    {step === 3 && `اضغط على -${2 * problem.a}x للتحقق من الحد الأوسط`}
                    {step === 4 && 'أدخل قيمة b في قوس الفرق'}
                    {step === 5 && '✓ تمت الاستعادة بنجاح'}
                </p>

                {/* الحدود الثلاثة — الإشارة سالبة بين الحدود */}
                <div className="flex flex-wrap items-center justify-center gap-3 font-mono font-black text-lg" dir="ltr">

                    {/* x² */}
                    <motion.div
                        onClick={handleFirstTermClick}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 1 && (e.preventDefault(), handleFirstTermClick())}
                        role="button" tabIndex={step === 1 ? 0 : -1} aria-label="اضغط على x² لاستخراج جذره"
                        whileTap={step === 1 ? { scale: 0.92 } : {}}
                        className={`px-5 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${step === 1 ? `cursor-pointer border-cyan-400 ${isDarkMode ? 'bg-cyan-500/10 text-white animate-pulse' : 'bg-cyan-50 text-cyan-700'}` :
                                step >= 2 ? `text-sky-400 ${isDarkMode ? 'bg-sky-500/10 border-sky-500/30' : 'bg-sky-50 border-sky-200'}` :
                                    `opacity-30 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-400'}`
                            }`}
                    >x²</motion.div>

                    {/* ← الفرق الجوهري: إشارة ناقص */}
                    <span className="text-rose-400 font-black">-</span>

                    {/* الحد الأوسط */}
                    <motion.div
                        onClick={handleMiddleTermClick}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 3 && (e.preventDefault(), handleMiddleTermClick())}
                        role="button" tabIndex={step === 3 ? 0 : -1} aria-label={`اضغط على ${2 * problem.a}x للتحقق من الحد الأوسط`}
                        whileTap={step === 3 ? { scale: 0.92 } : {}}
                        className={`px-5 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 ${step === 3 ? `cursor-pointer border-rose-400 ${isDarkMode ? 'bg-rose-500/10 text-white animate-pulse' : 'bg-rose-50 text-rose-700'}` :
                                step > 3 ? `text-rose-400 ${isDarkMode ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-50 border-rose-200'}` :
                                    `opacity-30 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-400'}`
                            }`}
                    >{2 * problem.a}x</motion.div>

                    <span className={`opacity-40 ${theme.textMain}`}>+</span>

                    {/* الحد الأخير b² */}
                    <motion.div
                        onClick={handleLastTermClick}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 2 && (e.preventDefault(), handleLastTermClick())}
                        role="button" tabIndex={step === 2 ? 0 : -1} aria-label={`اضغط على ${problem.a * problem.a} لاستخراج جذره`}
                        whileTap={step === 2 ? { scale: 0.92 } : {}}
                        className={`px-5 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${step === 2 ? `cursor-pointer border-amber-400 ${isDarkMode ? 'bg-amber-500/10 text-white animate-pulse' : 'bg-amber-50 text-amber-700'}` :
                                step >= 3 ? `text-amber-400 ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}` :
                                    `opacity-30 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-400'}`
                            }`}
                    >{problem.a * problem.a}</motion.div>
                </div>

                {/* الجذور المستخرجة */}
                <div className="flex items-center justify-center gap-12 min-h-[56px]">
                    <AnimatePresence>
                        {step >= 2 && (
                            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-1">
                                <ArrowDown size={18} className="text-sky-400" />
                                <div className={`px-4 py-2 rounded-xl border font-mono text-sm font-black ${isDarkMode ? 'bg-black/40 border-sky-500/30 text-sky-400' : 'bg-sky-50 border-sky-200 text-sky-600'}`}>x</div>
                            </motion.div>
                        )}
                        {step >= 3 && (
                            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-1">
                                <ArrowDown size={18} className="text-amber-400" />
                                <div className={`px-4 py-2 rounded-xl border font-mono text-sm font-black ${isDarkMode ? 'bg-black/40 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>{problem.a}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* خطوة الإدخال */}
                <AnimatePresence>
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3 w-full"
                        >
                            <div className="flex items-center gap-2 font-mono font-black text-lg" dir="ltr">
                                <span className={`opacity-50 ${theme.textMain}`}>(x -</span>
                                <input
                                    type="number"
                                    value={inputA}
                                    onChange={e => setInputA(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && checkMastery()}
                                    aria-label="أدخل قيمة b"
                                    className={`w-20 rounded-xl text-center p-3 outline-none border-2 transition-all font-black ${error
                                            ? 'border-rose-500'
                                            : isDarkMode ? 'bg-black/60 border-rose-500/50 text-rose-400 focus:border-rose-400' : 'bg-white border-rose-200 text-rose-700 focus:border-rose-500'
                                        }`}
                                    placeholder="?"
                                    autoFocus
                                />
                                <span className={`opacity-50 ${theme.textMain}`}>)²</span>
                            </div>
                            <LabTutorialNote
                                from={`استخرجت جذر الحد الأول (x) وجذر الحد الأخير (√${problem.a * problem.a} = ${problem.a}).`}
                                why={`لتأكيد صحة التحليل، يجب أن يساوي الحد الأوسط (سالب) ضعف حاصل ضرب الجذرين: -2 × x × ${problem.a} = -${2 * problem.a}x — الإشارة السالبة هي ما يميز هذه المتطابقة عن الأولى.`}
                            />
                            <button
                                onClick={checkMastery}
                                className="px-8 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black flex items-center gap-2 transition-all"
                            >
                                <CheckCircle2 size={18} /> تأكيد
                            </button>
                        </motion.div>
                    )}

                    {/* النتيجة النهائية */}
                    {step === 5 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-2xl border-2 font-mono font-black text-lg text-center ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}
                            dir="ltr"
                        >
                            <span className={`opacity-60 ${theme.textMain}`}>(</span>
                            <span className="text-sky-400">x</span>
                            <span className="text-rose-400"> - </span>
                            <span className="text-amber-400">{problem.a}</span>
                            <span className={`opacity-60 ${theme.textMain}`}>)²</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LabChallenge>
    );
}

export default function FactIdentity2Lab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="fact-id2"
            phase={phase}
            title="تحليل مربع الفرق"
            badgeText="التحليل العكسي — المتطابقة الثانية"
            badgeIcon={MinusCircle}
            accentColor="rose"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <FactIdentity2Content phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
