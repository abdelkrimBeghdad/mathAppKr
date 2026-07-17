import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Divide, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabStepsPanel from './LabStepsPanel';
import { useLabTheme } from './LabThemeContext';

// خوارزمية إقليدس — تولّد كل خطوات القسمة المتتالية حتى الوصول لباقٍ صفري
function computeSteps(a, b) {
    const steps = [];
    let x = a, y = b;
    while (y !== 0) {
        const q = Math.floor(x / y);
        const r = x % y;
        steps.push({ a: x, b: y, q, r });
        x = y;
        y = r;
    }
    return { steps, pgcd: x };
}

function PGCDEuclideanContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [numbers, setNumbers] = useState({ a: 84, b: 60 });
    const [expectedSteps, setExpectedSteps] = useState([]);
    const [pgcd, setPgcd] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [completedRows, setCompletedRows] = useState([]);
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const current = expectedSteps[currentStep];

    useEffect(() => {
        labProgressService.getOne('pgcd-euclidean')
            .then(progress => { if (progress) setLevel(difficultyEngine.getLevel(progress)); })
            .catch(() => { });
    }, []);

    const learnPages = [
        { title: 'بروتوكول القسمة الإقليدية', detail: 'خوارزمية إقليدس تعتمد على تكرار القسمة: نقسم العدد الأكبر على الأصغر ونحتفظ بالباقي، ثم نكرر العملية مع المقسوم عليه والباقي.', math: 'a = b × q + r' },
        { title: 'شرط التوقف', detail: 'نكرر هذه الخطوة حتى نحصل على باقٍ يساوي صفر. عندها، آخر مقسوم عليه هو القاسم المشترك الأكبر.', math: 'r = 0 → PGCD = آخر b' },
    ];

    const generateProblem = () => {
        const params = difficultyEngine.getParams('pgcd', level);
        const options = params.pairs || [[48, 18], [60, 24], [84, 60], [105, 45]];
        const pair = options[Math.floor(Math.random() * options.length)];
        const a = Math.max(pair[0], pair[1]);
        const b = Math.min(pair[0], pair[1]);
        const { steps, pgcd: p } = computeSteps(a, b);

        setNumbers({ a, b });
        setExpectedSteps(steps);
        setPgcd(p);
        setCurrentStep(0);
        setCompletedRows([]);
        setUserAnswer('');
        setError(false);
        setFeedback(null);
        setReward(null);
        setPhase('practice');
        labProgressService.update('pgcd-euclidean', 'practice').catch(() => { });
    };

    const handleSubmit = async () => {
        const val = parseInt(userAnswer);
        if (isNaN(val) || val < 0 || !current) return;

        if (val !== current.r) {
            setError(true);
            setFeedback({ type: 'error', text: 'باقي القسمة غير صحيح. راجع الحساب.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 900);
            return;
        }

        const newRows = [...completedRows, { ...current }];
        setCompletedRows(newRows);
        setUserAnswer('');
        setError(false);
        setFeedback({ type: 'success', text: 'صحيح! انتقل للخطوة التالية.' });

        if (current.r === 0) {
            await labProgressService.update('pgcd-euclidean', 'completed', 100).catch(() => { });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward('pgcd-euclidean');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setTimeout(() => { setCurrentStep(s => s + 1); setFeedback(null); }, 700);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Divide size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم خوارزمية إقليدس القديمة — طريقة أنيقة وسريعة لإيجاد القاسم المشترك الأكبر عبر تكرار القسمة.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    المستوى الحالي: {['', 'مبتدئ', 'متوسط', 'متقدم'][level]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
                </button>
            </div>
            <button onClick={generateProblem} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
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
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <span className="font-mono font-black text-indigo-400" dir="ltr">{learnPages[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={generateProblem} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">ابدأ التحدي <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge + LabStepsPanel (سجل الخطوات) ─────────
    // نبني سجل الخطوات: المكتملة (done)، الحالية (active)، والمتبقية (لا تظهر بعد)
    const stepsForPanel = [
        ...completedRows.map(row => ({
            label: `${row.a} = ${row.b}×${row.q} + ${row.r}`,
            done: true,
        })),
        ...(current ? [{ label: `${current.a} = ${current.b}×? + ?`, active: true }] : []),
    ];

    return (
        <LabChallenge
            type="text"
            current={completedRows.length + 1}
            total={expectedSteps.length}
            level={level}
            question={current ? `احسب باقي قسمة ${current.a} على ${current.b}` : ''}
            hint="القسمة الإقليدية: a = b×q + r. احسب r فقط (الباقي)."
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
            sidePanel={<LabStepsPanel title="سجل القسمة الإقليدية" steps={stepsForPanel} />}
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                <span className={theme.textMain}>r =</span>
                <input
                    type="number" value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    aria-label="أدخل باقي القسمة"
                    autoFocus
                    className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400 focus:border-indigo-400' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'
                        }`}
                    placeholder="؟"
                />
            </div>
            <button onClick={handleSubmit} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <Send size={18} /> تأكيد الباقي
            </button>
        </LabChallenge>
    );
}

export default function PGCDEuclideanLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="pgcd-euclidean"
            phase={phase}
            title="خوارزمية إقليدس"
            badgeText="القسمة الإقليدية المتكررة"
            badgeIcon={Divide}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <PGCDEuclideanContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
