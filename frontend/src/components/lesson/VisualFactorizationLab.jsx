import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Binary, Boxes, Microscope } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';

const LAB_ID = 'fact-common';

// 3 جولات تصاعدية الصعوبة (مبتدئ ➜ متوسط ➜ متقدم) قبل منح المكافأة
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, ...difficultyEngine.generateChallenge(LAB_ID, lvl) }));
}

function VisualFactorizationContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(1); // 1:split 2:factor 3:input 4:done
    const [error, setError] = useState(false);
    const [term1Split, setTerm1Split] = useState(false);
    const [term2Split, setTerm2Split] = useState(false);
    const [selectedFactors, setSelectedFactors] = useState({ left: false, right: false });
    const [inputs, setInputs] = useState({ outer: '', inner: '' });
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const problem = rounds[round]; // { level, a, c, q, hint }
    const term2 = problem.a * problem.c;

    useEffect(() => {
        labProgressService.getOne(LAB_ID)
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
            title: 'بروتوكول الاستخلاص الجبري',
            detail: 'التحليل هو العملية العكسية للنشر — نبحث عن العامل المشترك الذي يتكرر في كل الحدود لسحبه خارجاً.',
            math: 'ax + ab = a(x + b)',
            icon: <Microscope size={20} />,
        },
        {
            title: 'خوارزمية التفكيك',
            detail: 'نفكّك كل حد لنرى الأرقام المختبئة داخله، ثم نحدد العنصر المكرر بدقة.',
            math: '4x + 12 = (4 × x) + (4 × 3)',
            icon: <Binary size={20} />,
        },
        {
            title: 'الجولات الثلاث',
            detail: 'ستحلل 3 عبارات مختلفة: سهلة، ثم أصعب، ثم الأصعب (وقد تحتوي على أعداد سالبة). المكافأة تُمنح فقط بعد الجولة الثالثة لضمان إتقانك الحقيقي.',
            math: 'مبتدئ ➜ متوسط ➜ متقدم',
            icon: <Boxes size={20} />,
        },
    ];

    const resetStep = () => {
        setStep(1);
        setTerm1Split(false);
        setTerm2Split(false);
        setSelectedFactors({ left: false, right: false });
        setInputs({ outer: '', inner: '' });
        setFeedback(null);
        setError(false);
    };

    const startPractice = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        resetStep();
        setReward(null);
        setPhase('practice');
        labProgressService.update(LAB_ID, 'practice').catch(() => { });
    };

    const handleTerm1Click = () => {
        if (step === 1 && !term1Split) {
            setTerm1Split(true);
            if (term2Split) setTimeout(() => setStep(2), 800);
        }
    };

    const handleTerm2Click = () => {
        if (step === 1 && !term2Split) {
            setTerm2Split(true);
            if (term1Split) setTimeout(() => setStep(2), 800);
        }
    };

    const handleFactorClick = (side, factor) => {
        if (step !== 2 || factor !== problem.a) return;
        const newSelected = { ...selectedFactors, [side]: true };
        setSelectedFactors(newSelected);
        if (newSelected.left && newSelected.right) setTimeout(() => setStep(3), 800);
    };

    const checkMastery = async () => {
        if (parseInt(inputs.outer) === problem.a && parseInt(inputs.inner) === problem.c) {
            setStep(4);
            setFeedback({ type: 'success', text: 'تم التحليل بالعامل المشترك بنجاح!' });

            if (round < 2) {
                setTimeout(() => {
                    setFeedback({ type: 'success', text: `أحسنت! الجولة التالية أصعب.` });
                    setTimeout(() => {
                        setRound(r => r + 1);
                        resetStep();
                    }, 1400);
                }, 500);
            } else {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update(LAB_ID, 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward(LAB_ID, {
                        type: 'factor-common',
                        a: problem.a,
                        c: problem.c,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'تحقق من العامل المشترك أو الحد الداخلي.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1500);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>مبدأ الاستخلاص:</h3>
                <div className={`p-4 rounded-xl border font-mono text-center text-sm text-cyan-400 mb-4 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-cyan-50 border-cyan-100'}`}>
                    ax + ab = a(x+b)
                </div>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-50 text-cyan-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100'}`}>
                    فتح دليل الاستخلاص
                </button>
            </div>
            <motion.button onClick={startPractice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-cyan-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                    <Microscope size={40} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء التحليل</span>
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
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">{learnPages[learnStep].icon}</div>
                        <h3 className={`text-lg font-black ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                        <p className={`text-sm ${theme.textSub} max-w-lg font-medium leading-relaxed`}>{learnPages[learnStep].detail}</p>
                        <div className={`p-5 rounded-2xl border-2 border-cyan-500/30 w-full ${isDarkMode ? 'bg-black/40' : 'bg-cyan-50'}`}>
                            <span className="font-mono font-black text-cyan-400" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')} className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black">التالي</button>
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
            level={problem.level}
            hint="اضغط أولاً على كل حد لتفكيكه، ثم اختر العامل المكرر في الحدين."
            feedback={feedback}
            reward={reward}
            onRefresh={() => { resetStep(); }}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            {/* ── العبارة التفاعلية ─────────────────────────────────────────── */}
            <div className="w-full">
                {/* تعليمة الخطوة */}
                <p className={`text-[11px] uppercase tracking-widest font-black text-center mb-4 ${theme.textSub}`}>
                    {step === 1 ? 'اضغط على كل حد لتفكيكه' :
                        step === 2 ? 'اضغط على العامل المكرر في الحدين' :
                            step === 3 ? 'أدخل نتيجة التحليل' : '✓ تم التحليل'}
                </p>

                {/* العبارة */}
                <div className="flex flex-wrap items-center justify-center gap-4 font-mono font-black text-lg" dir="ltr">

                    {/* الحد الأول */}
                    {!term1Split ? (
                        <motion.div
                            onClick={handleTerm1Click}
                            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleTerm1Click())}
                            role="button" tabIndex={0} aria-label={`فكك الحد ${problem.a}x`}
                            whileTap={{ scale: 0.95 }}
                            className={`p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${isDarkMode ? 'bg-black/40 border-cyan-500/30 text-white hover:border-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:border-cyan-400'}`}
                        >{problem.a}x</motion.div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <motion.div
                                initial={{ scale: 0.7 }} animate={{ scale: 1 }}
                                onClick={() => handleFactorClick('left', problem.a)}
                                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleFactorClick('left', problem.a))}
                                role="button" tabIndex={0} aria-label={`اختر العامل ${problem.a} من الحد الأول`}
                                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${selectedFactors.left ? 'bg-cyan-500 border-cyan-400 text-white scale-110' : isDarkMode ? 'bg-black/60 border-white/10 text-slate-400 hover:border-cyan-500' : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-400'}`}
                            >{problem.a}</motion.div>
                            <span className="opacity-30 text-sm">×</span>
                            <div className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 opacity-20 ${isDarkMode ? 'border-white/5 text-white' : 'border-slate-200 text-slate-400'}`}>x</div>
                        </div>
                    )}

                    <span className="opacity-30">{term2 >= 0 ? '+' : '-'}</span>

                    {/* الحد الثاني */}
                    {!term2Split ? (
                        <motion.div
                            onClick={handleTerm2Click}
                            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleTerm2Click())}
                            role="button" tabIndex={0} aria-label={`فكك الحد ${Math.abs(term2)}`}
                            whileTap={{ scale: 0.95 }}
                            className={`p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${isDarkMode ? 'bg-black/40 border-cyan-500/30 text-white hover:border-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:border-cyan-400'}`}
                        >{Math.abs(term2)}</motion.div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <motion.div
                                initial={{ scale: 0.7 }} animate={{ scale: 1 }}
                                onClick={() => handleFactorClick('right', problem.a)}
                                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleFactorClick('right', problem.a))}
                                role="button" tabIndex={0} aria-label={`اختر العامل ${problem.a} من الحد الثاني`}
                                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${selectedFactors.right ? 'bg-cyan-500 border-cyan-400 text-white scale-110' : isDarkMode ? 'bg-black/60 border-white/10 text-slate-400 hover:border-cyan-500' : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-400'}`}
                            >{problem.a}</motion.div>
                            <span className="opacity-30 text-sm">×</span>
                            <div className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 opacity-20 ${isDarkMode ? 'border-white/5 text-white' : 'border-slate-200 text-slate-400'}`}>{Math.abs(problem.c)}</div>
                        </div>
                    )}
                </div>

                {/* خطوة الإدخال */}
                <AnimatePresence>
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 font-mono font-black text-lg" dir="ltr">
                                <input type="number" value={inputs.outer} onChange={e => setInputs({ ...inputs, outer: e.target.value })}
                                    aria-label="العامل المشترك"
                                    className={`w-20 rounded-xl text-center p-3 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400 focus:border-cyan-400' : 'bg-white border-cyan-200 text-cyan-700 focus:border-cyan-500'}`}
                                    placeholder="?" autoFocus
                                />
                                <span className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}>(x +</span>
                                <input type="number" value={inputs.inner} onChange={e => setInputs({ ...inputs, inner: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && checkMastery()}
                                    aria-label="الحد الداخلي"
                                    className={`w-20 rounded-xl text-center p-3 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-white/10 text-white focus:border-cyan-400' : 'bg-white border-slate-200 text-slate-700 focus:border-cyan-400'}`}
                                    placeholder="?"
                                />
                                <span className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}>)</span>
                            </div>

                            <LabTutorialNote
                                from={`العبارة الأصلية هي ${problem.a}x ${term2 >= 0 ? '+' : '-'} ${Math.abs(term2)}، وقد لاحظنا أن ${problem.a} يتكرر في كلا الحدين.`}
                                why={`بما أن ${problem.a} عامل مشترك للحدين، يمكننا سحبه للخارج وكتابة الباقي بين قوسين: ${problem.a}(x + ${problem.c}). هذا يعيد كتابة الجمع كضرب دون تغيير قيمة العبارة.`}
                            />

                            <button onClick={checkMastery} className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black flex items-center gap-2 transition-all">
                                <CheckCircle2 size={18} /> تأكيد
                            </button>
                        </motion.div>
                    )}

                    {/* النتيجة النهائية */}
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`mt-4 p-4 rounded-2xl border-2 text-center font-mono font-black text-lg ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`} dir="ltr">
                            <span className="text-cyan-400">{problem.a}</span>
                            <span className={isDarkMode ? 'text-white' : 'text-slate-700'}> (x + {problem.c})</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LabChallenge>
    );
}

export default function VisualFactorizationLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId={LAB_ID}
            phase={phase}
            title="التحليل بالعامل المشترك"
            badgeText="استخلاص العامل المشترك"
            badgeIcon={Boxes}
            accentColor="cyan"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VisualFactorizationContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
