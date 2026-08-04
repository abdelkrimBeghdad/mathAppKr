import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import { rewardService } from '../../utils/rewardService';

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

function ExpansionIdentity3Content({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(1);
    const [inputLast, setInputLast] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const problem = roundData; // { level, b }

    useEffect(() => {
        labProgressService.getOne('id3')
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
        { title: 'بروتوكول فرق المربعين', detail: 'المتطابقة الثالثة هي الأكثر اختصاراً، حيث يضرب مجموع حدين في فرقهما لينتج فرق مربعي الحدين.', math: '(a + b)(a − b) = a² − b²', icon: <Scissors size={20} /> },
        { title: 'خوارزمية التلاشي', detail: 'الحدود الوسطى (+ab) و (−ab) تلغي بعضها البعض تماماً، مما يجعل الناتج يتكون من حدين فقط.', math: '+ab − ab = 0 ⟶ حد أوسط يختفي', icon: <Layers size={20} /> },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(1);
        setInputLast('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('id3', 'practice').catch(() => { });
    };

    const handleTermAClick = () => { if (step === 1) setStep(2); };
    const handleTermBClick = () => { if (step === 2) setStep(3); };

    const checkMastery = async () => {
        const correctLast = problem.b * problem.b;
        if (parseInt(inputLast) === correctLast) {
            setStep(4);
            setError(false);
            if (round < 2) {
                setFeedback({ type: 'success', text: `انشطار مثالي! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => {
                    setRound(r => r + 1);
                    setStep(1);
                    setInputLast('');
                    setFeedback(null);
                }, 1600);
            } else {
                setFeedback({ type: 'success', text: 'انشطار مثالي! الحد الأوسط تلاشى كما هو متوقع.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('id3', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('id3', {
                        type: 'identity-diff-sq2', b: problem.b, lastTerm: correctLast,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: الحد الناقص هو مربع b.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>القاعدة الهيكلية:</h3>
                <div className={`p-4 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-cyan-50 border-cyan-100'}`}>
                    <span className="font-mono font-black text-cyan-400 text-sm" dir="ltr">(a + b)(a − b) = a² − b²</span>
                </div>
                <p className={`text-xs ${theme.textSub} mt-2 text-center`}>ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.</p>
                <div className={`mt-2 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-50 text-cyan-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100'}`}>
                    عرض بروتوكول النشر
                </button>
            </div>
            <motion.button onClick={startPractice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-cyan-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Scissors size={36} />
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
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-3">{learnPages[learnStep].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'}`}>
                        <span className="font-mono font-black text-cyan-400" dir="ltr">{learnPages[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
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
            onRefresh={() => { setStep(1); setInputLast(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="flex items-center justify-center font-mono font-black text-lg gap-2" dir="ltr">
                    <span className={`opacity-40 ${theme.textMain}`}>(</span>
                    <motion.div
                        onClick={handleTermAClick}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 1 && (e.preventDefault(), handleTermAClick())}
                        role="button" tabIndex={step === 1 ? 0 : -1} aria-label="اضغط على x للمتابعة"
                        whileTap={step === 1 ? { scale: 0.9 } : {}}
                        className={`px-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${step === 1 ? 'cursor-pointer' : ''} ${step >= 2 ? 'text-sky-400 bg-sky-500/10' : step === 1 ? `${theme.textMain} bg-white/5 border-2 border-white/20 animate-pulse` : 'opacity-20'
                            }`}
                    >x</motion.div>
                    <span className={`opacity-40 ${theme.textMain}`}>+</span>
                    <motion.div
                        onClick={handleTermBClick}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 2 && (e.preventDefault(), handleTermBClick())}
                        role="button" tabIndex={step === 2 ? 0 : -1} aria-label={`اضغط على ${problem.b} للمتابعة`}
                        whileTap={step === 2 ? { scale: 0.9 } : {}}
                        className={`px-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${step === 2 ? 'cursor-pointer' : ''} ${step >= 3 ? 'text-cyan-400 bg-cyan-500/10' : step === 2 ? `${theme.textMain} bg-white/5 border-2 border-white/20 animate-pulse` : 'opacity-20'
                            }`}
                    >{problem.b}</motion.div>
                    <span className={`opacity-40 ${theme.textMain}`}>)(</span>
                    <span className={step >= 2 ? 'text-sky-400' : 'opacity-20'}>x</span>
                    <span className={`opacity-40 ${theme.textMain}`}>-</span>
                    <span className={step >= 3 ? 'text-cyan-400' : 'opacity-20'}>{problem.b}</span>
                    <span className={`opacity-40 ${theme.textMain}`}>)</span>
                </div>

                <AnimatePresence>
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 w-full">
                            <div className="flex items-center justify-center gap-2 font-mono font-black text-base" dir="ltr">
                                <div className="relative text-sky-400">x<span className="absolute -top-3 -right-3 text-xs">2</span></div>
                                <span className={`opacity-40 ${theme.textMain}`}>-</span>
                                <input type="number" value={inputLast} onChange={e => setInputLast(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkMastery()} aria-label="أدخل مربع b" autoFocus
                                    className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-700'}`} placeholder="؟" />
                            </div>
                            <LabTutorialNote
                                from={`الحد الثاني في القوسين هو نفسه ${problem.b} (موجب في الأول، سالب في الثاني).`}
                                why={`عند نشر (x+${problem.b})(x-${problem.b})، الحدّان الوسطيّان (+${problem.b}x و-${problem.b}x) يتساويان في القيمة ويتعاكسان بالإشارة، فيلغيان بعضهما تماماً. يتبقى فقط: x² وسالب مربع ${problem.b} (=${problem.b * problem.b}).`}
                            />
                            <button onClick={checkMastery} className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black flex items-center gap-2 transition-all">
                                <CheckCircle2 size={18} /> تأكيد النتيجة
                            </button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-2xl border-2 font-mono font-black flex items-center gap-2 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}
                            dir="ltr"
                        >
                            <div className="relative text-sky-400">x<span className="absolute -top-3 -right-3 text-xs">2</span></div>
                            <span className={`opacity-40 ${theme.textMain}`}>-</span>
                            <span className="text-cyan-400">{problem.b * problem.b}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LabChallenge>
    );
}

export default function ExpansionIdentity3Lab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="id3"
            phase={phase}
            title="نشر فرق المربعين"
            badgeText="المتطابقة الشهيرة #3"
            badgeIcon={Scissors}
            accentColor="cyan"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <ExpansionIdentity3Content phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
