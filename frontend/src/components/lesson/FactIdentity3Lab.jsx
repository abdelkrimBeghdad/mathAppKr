import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Binary, ArrowDown, Split } from 'lucide-react';
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
        const b = Math.floor(Math.random() * maxB) + 2;
        return { level: lvl, b };
    });
}

function FactIdentity3Content({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(1); // 1:x² 2:b² 3:input 4:done
    const [inputB, setInputB] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const problem = roundData; // { level, b }

    useEffect(() => {
        labProgressService.getOne('fact-id3')
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
            title: 'بروتوكول الانشطار الجبري',
            detail: 'تحليل المتطابقة الثالثة هو تفكيك الفرق بين مربعين إلى قوسين متناظرين، أحدهما فرق والآخر مجموع.',
            math: 'a² - b² = (a - b)(a + b)',
            icon: <Split size={20} />,
        },
        {
            title: 'خوارزمية الجذور المتناظرة',
            detail: 'نستخرج جذري الحدين، ثم نضعهما في قوسين؛ أحدهما بعلامة (-) والآخر بعلامة (+). الترتيب لا يهم، لكن التناظر ضروري.',
            math: '√(a²) → a  ,  √(b²) → b',
            icon: <Binary size={20} />,
        },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(1);
        setInputB('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('fact-id3', 'practice').catch(() => { });
    };

    const handleFirstTermClick = () => { if (step === 1) setStep(2); };
    const handleLastTermClick = () => { if (step === 2) setStep(3); };

    const checkMastery = async () => {
        if (parseInt(inputB) === problem.b) {
            setStep(4);
            setError(false);
            if (round < 2) {
                setFeedback({ type: 'success', text: `تم الانشطار الجبري بنجاح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                setTimeout(() => {
                    setRound(r => r + 1);
                    setStep(1);
                    setInputB('');
                    setFeedback(null);
                }, 1600);
            } else {
                setFeedback({ type: 'success', text: 'تم الانشطار الجبري إلى قوسين متناظرين!' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('fact-id3', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('fact-id3', {
                        type: 'identity-diff-sq2', b: problem.b, lastTerm: problem.b * problem.b,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'تحقق من جذر الحد الأخير.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1500);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>خوارزمية التفكيك:</h3>
                <div className={`p-4 rounded-xl border font-mono text-center text-sm text-cyan-400 mb-4 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-cyan-50 border-cyan-100'}`}>
                    a² - b² = (a - b)(a + b)
                </div>
                <div className={`mb-3 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-50 text-cyan-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100'}`}
                >
                    فتح دليل الانشطار
                </button>
            </div>
            <motion.button
                onClick={startPractice}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-cyan-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                    <Split size={40} />
                    <span className="font-black text-xl uppercase tracking-widest">تفعيل الانشطار</span>
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
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                            {learnPages[learnStep].icon}
                        </div>
                        <h3 className={`text-lg font-black ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-cyan-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-cyan-50'}`}>
                            <span className="font-mono font-black text-cyan-400" dir="ltr">{learnPages[learnStep].math}</span>
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
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black">التالي</button>
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
            hint="استخرج جذري الحدين، ثم ضعهما في قوسين متناظرين (فرق ومجموع)."
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(1); setInputB(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">

                {/* تعليمة الخطوة */}
                <p className={`text-[11px] uppercase tracking-widest font-black text-center ${theme.textSub}`}>
                    {step === 1 && 'اضغط على x² لاستخراج جذره'}
                    {step === 2 && `اضغط على ${problem.b * problem.b} لاستخراج جذره`}
                    {step === 3 && 'أدخل الجذر في القوس الأول'}
                    {step === 4 && '✓ تم الانشطار بنجاح'}
                </p>

                {/* الحدود */}
                <div className="flex flex-wrap items-center justify-center gap-3 font-mono font-black text-lg" dir="ltr">
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

                    <span className="text-rose-400 font-black">-</span>

                    <motion.div
                        onClick={handleLastTermClick}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 2 && (e.preventDefault(), handleLastTermClick())}
                        role="button" tabIndex={step === 2 ? 0 : -1} aria-label={`اضغط على ${problem.b * problem.b} لاستخراج جذره`}
                        whileTap={step === 2 ? { scale: 0.92 } : {}}
                        className={`px-5 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${step === 2 ? `cursor-pointer border-amber-400 ${isDarkMode ? 'bg-amber-500/10 text-white animate-pulse' : 'bg-amber-50 text-amber-700'}` :
                                step >= 3 ? `text-amber-400 ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}` :
                                    `opacity-30 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-400'}`
                            }`}
                    >{problem.b * problem.b}</motion.div>
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
                                <div className={`px-4 py-2 rounded-xl border font-mono text-sm font-black ${isDarkMode ? 'bg-black/40 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>{problem.b}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* خطوة الإدخال — قوسان معاً */}
                <AnimatePresence>
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3 w-full"
                        >
                            <div className="flex flex-wrap items-center justify-center gap-3 font-mono font-black" dir="ltr">
                                {/* القوس الأول — قابل للتعديل */}
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                    <span className={`opacity-40 ${theme.textMain}`}>(</span>
                                    <span className="text-sky-400">x</span>
                                    <span className="text-rose-400">-</span>
                                    <input
                                        type="number"
                                        value={inputB}
                                        onChange={e => setInputB(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && checkMastery()}
                                        aria-label="أدخل قيمة الجذر"
                                        className={`w-16 rounded-xl text-center p-2 outline-none border-2 transition-all font-black text-base ${error
                                                ? 'border-rose-500'
                                                : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400 focus:border-cyan-400' : 'bg-white border-cyan-200 text-cyan-700 focus:border-cyan-500'
                                            }`}
                                        placeholder="?"
                                        autoFocus
                                    />
                                    <span className={`opacity-40 ${theme.textMain}`}>)</span>
                                </div>

                                {/* القوس الثاني — يظهر تلقائياً بنفس القيمة */}
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border opacity-70 ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                    <span className={`opacity-40 ${theme.textMain}`}>(</span>
                                    <span className="text-sky-400">x</span>
                                    <span className="text-emerald-400">+</span>
                                    <span className="text-amber-400">{inputB || '?'}</span>
                                    <span className={`opacity-40 ${theme.textMain}`}>)</span>
                                </div>
                            </div>
                            <LabTutorialNote
                                from={`الحد الثاني هو ${problem.b * problem.b} (وهو مربع تام: ${problem.b}²).`}
                                why={`فرق المربعين ينشطر دائماً إلى قوسين متناظرين: أحدهما بفرق الجذرين والآخر بمجموعهما — (x−${problem.b})(x+${problem.b}). لهذا نحتاج فقط جذر الحد الأخير (${problem.b}) لإكمال كلا القوسين.`}
                            />
                            <button
                                onClick={checkMastery}
                                className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black flex items-center gap-2 transition-all"
                            >
                                <CheckCircle2 size={18} /> تأكيد الانشطار
                            </button>
                        </motion.div>
                    )}

                    {/* النتيجة النهائية */}
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-2xl border-2 text-center flex flex-wrap items-center justify-center gap-3 font-mono font-black ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}
                            dir="ltr"
                        >
                            <span>
                                <span className={`opacity-60 ${theme.textMain}`}>(</span>
                                <span className="text-sky-400">x</span>
                                <span className="text-rose-400"> - </span>
                                <span className="text-amber-400">{problem.b}</span>
                                <span className={`opacity-60 ${theme.textMain}`}>)</span>
                            </span>
                            <span>
                                <span className={`opacity-60 ${theme.textMain}`}>(</span>
                                <span className="text-sky-400">x</span>
                                <span className="text-emerald-400"> + </span>
                                <span className="text-amber-400">{problem.b}</span>
                                <span className={`opacity-60 ${theme.textMain}`}>)</span>
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LabChallenge>
    );
}

export default function FactIdentity3Lab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="fact-id3"
            phase={phase}
            title="تحليل فرق المربعين"
            badgeText="الانشطار الجبري — المتطابقة الثالثة"
            badgeIcon={Split}
            accentColor="cyan"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <FactIdentity3Content phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
