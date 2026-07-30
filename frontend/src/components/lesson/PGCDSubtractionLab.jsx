import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabStepsPanel from './LabStepsPanel';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

// خوارزمية إقليدس بالطرح المتتالي — تنتهي عندما يتساوى العددان (الفرق = صفر)
function computeSteps(a, b) {
    const steps = [];
    let x = Math.max(a, b), y = Math.min(a, b);
    while (y !== 0) {
        const diff = x - y;
        steps.push({ a: x, b: y, diff });
        if (diff > y) { x = diff; } else { x = y; y = diff; }
    }
    return steps;
}

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => {
        const params = difficultyEngine.getParams('pgcd', lvl);
        const options = params.pairs || [[24, 18], [30, 20], [36, 24], [48, 18]];
        const pair = options[Math.floor(Math.random() * options.length)];
        const a = Math.max(pair[0], pair[1]);
        const b = Math.min(pair[0], pair[1]);
        return { level: lvl, a, b, steps: computeSteps(a, b) };
    });
}

function PGCDSubtractionContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [completedRows, setCompletedRows] = useState([]);
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round]; // { level, a, b, steps }
    const current = roundData.steps[currentStep];
    const pgcd = roundData.steps.length > 0 ? roundData.steps[roundData.steps.length - 1].a : roundData.a;

    useEffect(() => {
        labProgressService.getOne('pgcd-subtraction')
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
        { title: 'بروتوكول التآكل الرقمي', detail: 'القاسم المشترك الأكبر لعددين هو نفسه القاسم المشترك بين أصغرهما والفارق بينهما. نستمر في الطرح حتى نصل إلى الصفر.', math: 'PGCD(a, b) = PGCD(b, a − b)' },
        { title: 'خوارزمية ترحيل القيم', detail: 'في كل خطوة، ينتقل الفرق والعدد الأصغر ليصبحا طرفي العملية القادمة. عندما يتساوى العددان، يصبح الفرق صفراً، والعدد الأخير هو القاسم المشترك.', math: 'PGCD(24,18) → PGCD(6,6) → 6' },
        { title: 'الجولات الثلاث', detail: 'ستطبّق الخوارزمية على 3 أزواج مختلفة من الأعداد بصعوبة تصاعدية. المكافأة تُمنح فقط بعد الزوج الثالث (الأصعب).', math: 'مبتدئ ➜ متوسط ➜ متقدم' },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setCurrentStep(0);
        setCompletedRows([]);
        setUserAnswer('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('pgcd-subtraction', 'practice').catch(() => { });
    };

    const handleSubmit = async () => {
        const val = parseInt(userAnswer);
        if (isNaN(val) || !current) return;

        if (val !== current.diff) {
            setError(true);
            setFeedback({ type: 'error', text: 'الفارق غير صحيح. راجع الطرح.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 900);
            return;
        }

        const newRows = [...completedRows, { ...current }];
        setCompletedRows(newRows);
        setUserAnswer('');
        setError(false);
        setFeedback({ type: 'success', text: 'صحيح! انتقل للخطوة التالية.' });

        if (currentStep < roundData.steps.length - 1) {
            setTimeout(() => { setCurrentStep(s => s + 1); setFeedback(null); }, 700);
        } else if (round < 2) {
            setTimeout(() => {
                setFeedback({ type: 'success', text: `أحسنت! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => {
                    setRound(r => r + 1);
                    setCurrentStep(0);
                    setCompletedRows([]);
                    setFeedback(null);
                }, 1400);
            }, 300);
        } else {
            await labProgressService.update('pgcd-subtraction', 'completed', 100).catch(() => { });
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#38bdf8', '#818cf8', '#34d399'] });
            try {
                const data = await rewardService.claimLabReward('pgcd-subtraction', {
                    type: 'pgcd', a: roundData.a, b: roundData.b, result: pgcd,
                });
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-sky-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Minus size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    اكتشف القاسم المشترك الأكبر عبر تقليص الفوارق خطوة بخطوة — نسخة الطرح المتتالي من خوارزمية إقليدس.
                    ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-50 text-sky-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
                </button>
            </div>
            <button onClick={startPractice} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي الشرح والبدء بالتحدي
            </button>
        </div>
    );

    // ── learn ─────────────────────────────────────────────────────────────────
    if (phase === 'learn') return (
        <div className="w-full max-w-3xl px-2">
            <AnimatePresence mode="wait">
                <motion.div key={learnStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-[1rem] border backdrop-blur-3xl text-center ${theme.card}`}
                >
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-sky-500/20' : 'bg-sky-50 border-sky-100'}`}>
                        <span className="font-mono font-black text-sky-400" dir="ltr">{learnPages[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">ابدأ التحدي <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge + LabStepsPanel ────────────────────────
    const stepsForPanel = [
        ...completedRows.map(row => ({
            label: `${row.a} − ${row.b} = ${row.diff}`,
            done: true,
        })),
        ...(current ? [{ label: `${current.a} − ${current.b} = ?`, active: true }] : []),
    ];

    const totalStepsSoFar = rounds.slice(0, round).reduce((s, r) => s + r.steps.length, 0);

    return (
        <LabChallenge
            type="text"
            current={totalStepsSoFar + completedRows.length + 1}
            total={rounds.reduce((s, r) => s + r.steps.length, 0)}
            level={roundData.level}
            question={current ? `احسب الفارق: ${current.a} − ${current.b}` : ''}
            hint="نطرح الأصغر من الأكبر في كل خطوة، ونكرر حتى يتساوى العددان."
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setCurrentStep(0); setCompletedRows([]); setUserAnswer(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
            sidePanel={<LabStepsPanel title="سجل عمليات الطرح" steps={stepsForPanel} />}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                <span className={theme.textMain}>الفارق =</span>
                <input
                    type="number" value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    aria-label="أدخل الفارق"
                    autoFocus
                    className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-sky-500/50 text-sky-400 focus:border-sky-400' : 'bg-white border-sky-200 text-sky-700 focus:border-sky-500'
                        }`}
                    placeholder="؟"
                />
            </div>

            <LabTutorialNote
                from={current ? `العددان الحاليان هما ${current.a} و${current.b} (إما العددان الأصليان، أو ناتجا الخطوة السابقة).` : ''}
                why={current ? `في كل خطوة نستبدل الزوج الحالي بالزوج (الأصغر، الفارق)، وهذا يُصغّر المسألة تدريجياً حتى يتساوى العددان (الفارق = صفر) — عندها العدد المتبقي هو القاسم المشترك الأكبر.` : ''}
            />

            <button onClick={handleSubmit} className="mt-4 w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <Send size={18} /> تأكيد الفارق
            </button>
        </LabChallenge>
    );
}

export default function PGCDSubtractionLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="pgcd-subtraction"
            phase={phase}
            title="الطرح المتتالي"
            badgeText="خوارزمية إقليدس بالطرح"
            badgeIcon={Minus}
            accentColor="sky"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <PGCDSubtractionContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
