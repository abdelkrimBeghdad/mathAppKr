import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabStepsPanel from './LabStepsPanel';
import { useLabTheme } from './LabThemeContext';

function getDivisors(n) {
    const divs = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) divs.push(i);
    return divs;
}

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => {
        const params = difficultyEngine.getParams('pgcd', lvl);
        const pairs = params.pairs || [[12, 18], [15, 25], [20, 30]];
        const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
        return { level: lvl, a, b };
    });
}

function PGCDDivisorsContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(1); // 1: قواسم a، 2: قواسم b، 3: المشتركة، 4: PGCD
    const [foundDivisorsA, setFoundDivisorsA] = useState([]);
    const [foundDivisorsB, setFoundDivisorsB] = useState([]);
    const [foundCommon, setFoundCommon] = useState([]);
    const [pgcdInput, setPgcdInput] = useState('');
    const [inputVal, setInputVal] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const numbers = { a: roundData.a, b: roundData.b };

    useEffect(() => {
        labProgressService.getOne('pgcd-divisors')
            .then(progress => {
                if (progress) {
                    const lvl = difficultyEngine.getLevel(progress);
                    setBaseLevel(lvl);
                    setRounds(buildRounds(lvl));
                }
            })
            .catch(() => { });
    }, []);

    const allDivisorsA = useMemo(() => getDivisors(numbers.a), [numbers.a]);
    const allDivisorsB = useMemo(() => getDivisors(numbers.b), [numbers.b]);
    const commonDivisors = useMemo(() => allDivisorsA.filter(d => allDivisorsB.includes(d)), [allDivisorsA, allDivisorsB]);
    const pgcd = useMemo(() => Math.max(...commonDivisors), [commonDivisors]);

    const learnPages = [
        { title: 'بروتوكول جرد القواسم', detail: 'قواسم عدد طبيعي هي جميع الأعداد التي تقسمه بدون باقي. نبدأ دائماً بـ 1 وننتهي بالعدد نفسه.', math: 'a ÷ d = k (باقي 0)' },
        { title: 'المنطقة المشتركة', detail: 'بعد إيجاد قواسم كل عدد، نحدد الأرقام الموجودة في المجموعتين معاً. أكبر هذه الأرقام هو PGCD.', math: 'D(a) ∩ D(b) → Max = PGCD' },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(1);
        setFoundDivisorsA([]); setFoundDivisorsB([]); setFoundCommon([]);
        setPgcdInput(''); setInputVal('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('pgcd-divisors', 'practice').catch(() => { });
    };

    const handleAddDivisor = () => {
        const val = parseInt(inputVal);
        if (isNaN(val) || val <= 0) return;

        if (step === 1) {
            if (numbers.a % val !== 0 || foundDivisorsA.includes(val)) {
                setError(true); setFeedback({ type: 'error', text: 'ليس قاسماً صحيحاً، أو أدخلته من قبل.' });
                setTimeout(() => { setError(false); setFeedback(null); }, 900);
            } else {
                const newList = [...foundDivisorsA, val].sort((x, y) => x - y);
                setFoundDivisorsA(newList);
                if (newList.length === allDivisorsA.length) setStep(2);
            }
        } else if (step === 2) {
            if (numbers.b % val !== 0 || foundDivisorsB.includes(val)) {
                setError(true); setFeedback({ type: 'error', text: 'ليس قاسماً صحيحاً، أو أدخلته من قبل.' });
                setTimeout(() => { setError(false); setFeedback(null); }, 900);
            } else {
                const newList = [...foundDivisorsB, val].sort((x, y) => x - y);
                setFoundDivisorsB(newList);
                if (newList.length === allDivisorsB.length) setStep(3);
            }
        } else if (step === 3) {
            if (!commonDivisors.includes(val) || foundCommon.includes(val)) {
                setError(true); setFeedback({ type: 'error', text: 'هذا الرقم ليس قاسماً مشتركاً بين العددين.' });
                setTimeout(() => { setError(false); setFeedback(null); }, 900);
            } else {
                const newList = [...foundCommon, val].sort((x, y) => x - y);
                setFoundCommon(newList);
                if (newList.length === commonDivisors.length) setStep(4);
            }
        }
        setInputVal('');
    };

    const checkPGCD = async () => {
        if (parseInt(pgcdInput) === pgcd) {
            setError(false);
            if (round < 2) {
                setFeedback({ type: 'success', text: `صحيح! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => {
                    setRound(r => r + 1);
                    setStep(1);
                    setFoundDivisorsA([]); setFoundDivisorsB([]); setFoundCommon([]);
                    setPgcdInput('');
                    setFeedback(null);
                }, 1400);
            } else {
                setFeedback({ type: 'success', text: `صحيح! القاسم المشترك الأكبر هو ${pgcd}.` });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('pgcd-divisors', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('pgcd-divisors', {
                        type: 'pgcd', a: numbers.a, b: numbers.b, result: pgcd,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع القواسم المشتركة، واختر أكبرها.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 900);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>طريقة القوائم:</h3>
                <div className={`p-4 rounded-xl font-mono text-center ${isDarkMode ? 'bg-black/20 border border-white/5 text-emerald-400' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'}`}>D(a) ∩ D(b) = Common</div>
                <p className={`text-xs ${theme.textSub} mt-2 text-center`}>ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.</p>
                <div className={`mt-2 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                    فتح الدليل النظري
                </button>
            </div>
            <motion.button onClick={startPractice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-emerald-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Search size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">دخول الميدان</span>
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
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                        <span className="font-mono font-black text-emerald-400" dir="ltr">{learnPages[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black">دخول الميدان</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge + LabStepsPanel ────────────────────────
    const stepLabels = {
        1: `أدخل قواسم ${numbers.a}`,
        2: `أدخل قواسم ${numbers.b}`,
        3: 'اختر القواسم المشتركة',
        4: 'ما هو أكبر قاسم مشترك؟',
    };

    const stepsForPanel = [
        ...(foundDivisorsA.length ? [{ label: `D(${numbers.a}) = {${foundDivisorsA.join(', ')}}`, done: step > 1, active: step === 1 }] : []),
        ...(foundDivisorsB.length ? [{ label: `D(${numbers.b}) = {${foundDivisorsB.join(', ')}}`, done: step > 2, active: step === 2 }] : []),
        ...(foundCommon.length ? [{ label: `مشترك = {${foundCommon.join(', ')}}`, done: step > 3, active: step === 3 }] : []),
    ];

    return (
        <LabChallenge
            type="text"
            current={round * 4 + step}
            total={12}
            level={roundData.level}
            question={stepLabels[step]}
            hint={step < 4 ? 'اكتب القواسم واحداً تلو الآخر — سيتم التحقق من كل رقم فور إدخاله.' : 'اختر أكبر رقم موجود في قائمة القواسم المشتركة.'}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(1); setFoundDivisorsA([]); setFoundDivisorsB([]); setFoundCommon([]); setPgcdInput(''); setInputVal(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
            sidePanel={stepsForPanel.length ? <LabStepsPanel title="سجل الاكتشاف" steps={stepsForPanel} /> : undefined}
            tourSteps={[
                { target: 'lab-answer-input', title: 'اكتشاف القواسم', description: 'اكتب قواسم كل عدد واحداً تلو الآخر، ثم حدد القواسم المشتركة بينهما، وأخيراً أكبرها (PGCD).' },
                { target: 'lab-hint-button', title: 'بحاجة لمساعدة؟', description: 'اضغط هنا لتلميح سريع.' },
            ]}
        >
            {step < 4 ? (
                <>
                    <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                        <input
                            type="number" data-tour-id="lab-answer-input" value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddDivisor()}
                            aria-label="أدخل قاسماً"
                            autoFocus
                            className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400 focus:border-emerald-400' : 'bg-white border-emerald-200 text-emerald-700 focus:border-emerald-500'
                                }`}
                            placeholder="؟"
                        />
                    </div>
                    <button onClick={handleAddDivisor} className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                        <Send size={18} /> إضافة القاسم
                    </button>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-3 font-mono font-black text-lg" dir="ltr">
                        <span className={theme.textMain}>PGCD =</span>
                        <input
                            type="number" data-tour-id="lab-answer-input" value={pgcdInput}
                            onChange={e => setPgcdInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && checkPGCD()}
                            aria-label="أدخل القاسم المشترك الأكبر"
                            autoFocus
                            className={`w-24 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400 focus:border-indigo-400' : 'bg-white border-indigo-200 text-indigo-700 focus:border-indigo-500'
                                }`}
                            placeholder="؟"
                        />
                    </div>
                    <button onClick={checkPGCD} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                        <CheckCircle2 size={18} /> تأكيد PGCD
                    </button>
                </>
            )}
        </LabChallenge>
    );
}

export default function PGCDDivisorsLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="pgcd-divisors"
            phase={phase}
            title="القواسم المشتركة"
            badgeText="طريقة القوائم"
            badgeIcon={Search}
            accentColor="emerald"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <PGCDDivisorsContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
