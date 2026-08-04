import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, CheckCircle2, ArrowRight, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabStepsPanel from './LabStepsPanel';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficulty/algebra.js';
import { rewardService } from '../../utils/rewardService';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('sys-graph', lvl) }));
}

function SystemsGraphContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(0); // 0..4: خطوات، 5: تم
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const problem = roundData.problem; // { m1, b1, m2, b2, ansX, ansY, pt1_y1, pt1_y2, pt2_y1, pt2_y2 }

    useEffect(() => {
        labProgressService.getOne('sys-graph')
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
        { title: 'مبدأ الرسم البياني', detail: 'كل معادلة في الجملة تمثل خطاً مستقيماً. الحل هو النقطة الوحيدة التي يتقاطع فيها المستقيمان.' },
        { title: 'الصياغة الدالية', detail: 'نعزل y لتصبح المعادلة على شكل y = ax + b قابلة للرسم.', math: 'x + y = 3 ⟶ y = -x + 3' },
        { title: 'النقطتان السحريتان', detail: 'نعطي قيمتين اختياريتين لـ x (مثلاً 0 و3) ونحسب y المقابلة لرسم المستقيم.' },
        { title: 'المسح الإحداثي', detail: 'نرسم المستقيم الثاني بنفس الطريقة، ثم نقرأ إحداثيات نقطة التقاطع.' },
    ];

    const hints = [
        'المعادلة معطاة مباشرة على شكل y = mx + b؛ حدد m وb كما هما.',
        'عوض x بصفر في معادلة المستقيم الأول، ثم بـ 3.',
        'المعادلة الثانية معطاة أيضاً على شكل y = mx + b؛ حدد m وb.',
        'عوض x بصفر في معادلة المستقيم الثاني، ثم بـ 3.',
        'اقرأ إحداثيات نقطة تقاطع المستقيمين على الرسم.',
    ];

    const stepInstructions = [
        'صيغة y للدالة الأولى: y = mx + b',
        'جدول قيم المستقيم الأول (x=0 و x=3)',
        'صيغة y للدالة الثانية: y = mx + b',
        'جدول قيم المستقيم الثاني (x=0 و x=3)',
        'إحداثيات نقطة التقاطع (x, y)',
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(0);
        setInput1(''); setInput2('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('sys-graph', 'practice').catch(() => { });
    };

    const handleCheckStep = async () => {
        let isCorrect = false;
        if (step === 0) isCorrect = parseInt(input1) === problem.m1 && parseInt(input2) === problem.b1;
        else if (step === 1) isCorrect = parseInt(input1) === problem.pt1_y1 && parseInt(input2) === problem.pt1_y2;
        else if (step === 2) isCorrect = parseInt(input1) === problem.m2 && parseInt(input2) === problem.b2;
        else if (step === 3) isCorrect = parseInt(input1) === problem.pt2_y1 && parseInt(input2) === problem.pt2_y2;
        else if (step === 4) isCorrect = parseInt(input1) === problem.ansX && parseInt(input2) === problem.ansY;

        if (isCorrect) {
            setError(false);
            setInput1(''); setInput2('');
            setFeedback({ type: 'success', text: 'صحيح! انتقل للخطوة التالية.' });

            if (step < 4) {
                confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
                setTimeout(() => { setStep(s => s + 1); setFeedback(null); }, 900);
            } else if (round < 2) {
                setTimeout(() => {
                    setFeedback({ type: 'success', text: `أحسنت! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                    setTimeout(() => {
                        setRound(r => r + 1);
                        setStep(0);
                        setFeedback(null);
                    }, 1400);
                }, 300);
            } else {
                setTimeout(async () => {
                    setStep(5);
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                    await labProgressService.update('sys-graph', 'completed', 100).catch(() => { });
                    try {
                        const data = await rewardService.claimLabReward('sys-graph', {
                            type: 'linear-2pt', m: problem.m1, b: problem.b1,
                            p1: { x: 0, y: problem.pt1_y1 }, p2: { x: 3, y: problem.pt1_y2 },
                        });
                        if (data.status === 'success') setReward(data);
                    } catch (err) { console.error(err); }
                }, 900);
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع الحساب وحاول مرة أخرى.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-cyan-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Crosshair size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    تعلم كيف تحول المعادلات الجبرية إلى خطوط مستقيمة على الشبكة لتجد الحل بالعين المجردة.
                    ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-50 text-cyan-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
                </button>
            </div>
            <button onClick={startPractice} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
                تخطي الشرح والبدء بالمسح
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
                    {learnPages[learnStep].math && (
                        <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'}`}>
                            <span className="font-mono font-black text-cyan-400" dir="ltr">{learnPages[learnStep].math}</span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">بدء التدريب <Rocket size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge + LabStepsPanel (رسم بياني حي يتكيّف مع كل مسألة) ────────
    const stepsForPanel = [
        { label: `Eq (1): y = ${problem.m1}x ${problem.b1 >= 0 ? '+' : ''}${problem.b1}`, done: step > 0 },
        { label: `Eq (2): y = ${problem.m2}x ${problem.b2 >= 0 ? '+' : ''}${problem.b2}`, done: step > 2 },
        ...(step > 3 ? [{ label: `تقاطع: (${problem.ansX}, ${problem.ansY})`, active: step === 4 }] : []),
    ];

    // إحداثيات خط الرسم عند حدود العرض (x = -6 و x = 6) لكل مستقيم — تتكيّف ديناميكياً مع كل مسألة
    const line1X1 = -6, line1Y1 = problem.m1 * -6 + problem.b1;
    const line1X2 = 6, line1Y2 = problem.m1 * 6 + problem.b1;
    const line2X1 = -6, line2Y1 = problem.m2 * -6 + problem.b2;
    const line2X2 = 6, line2Y2 = problem.m2 * 6 + problem.b2;

    return (
        <LabChallenge
            type="text"
            current={round * 5 + step + 1}
            total={15}
            level={roundData.level}
            question={stepInstructions[step]}
            hint={hints[step]}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(0); setInput1(''); setInput2(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
            sidePanel={
                <div className="w-full md:w-56 flex-shrink-0 flex flex-col gap-3">
                    <LabStepsPanel title="سجل المعادلتين" steps={stepsForPanel} />
                    <div className={`relative w-full aspect-square rounded-[1rem] border-2 overflow-hidden ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10" />
                        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/10" />
                        <svg className="absolute inset-0 w-full h-full p-3 overflow-visible" viewBox="-5.5 -5.5 11 11">
                            <g transform="scale(1, -1)">
                                {step > 1 && (
                                    <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1 }}
                                        x1={line1X1} y1={line1Y1} x2={line1X2} y2={line1Y2} stroke="#f59e0b" strokeWidth="0.25" strokeLinecap="round" />
                                )}
                                {step > 3 && (
                                    <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1 }}
                                        x1={line2X1} y1={line2Y1} x2={line2X2} y2={line2Y2} stroke="#6366f1" strokeWidth="0.25" strokeLinecap="round" />
                                )}
                                {step > 3 && (
                                    <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.6 }}
                                        cx={problem.ansX} cy={problem.ansY} r="0.4" fill="#22d3ee" />
                                )}
                            </g>
                        </svg>
                    </div>
                </div>
            }
        >
            <div className="flex items-center gap-3 font-mono font-black text-lg flex-wrap justify-center" dir="ltr">
                {(step === 0 || step === 2) && (
                    <>
                        <span className={step === 0 ? 'text-orange-400' : 'text-indigo-400'}>y =</span>
                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="معامل x" autoFocus
                            className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-700'}`} placeholder="m" />
                        <span className={theme.textMain}>x +</span>
                        <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="الثابت"
                            className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-700'}`} placeholder="b" />
                    </>
                )}
                {(step === 1 || step === 3) && (
                    <div className="flex flex-col gap-2 w-full items-center">
                        <div className="flex items-center gap-2">
                            <span className={theme.textMain}>x=0 → y=</span>
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="y عند x يساوي 0" autoFocus
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-700'}`} placeholder="؟" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={theme.textMain}>x=3 → y=</span>
                            <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="y عند x يساوي 3"
                                className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-700'}`} placeholder="؟" />
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <>
                        <span className="text-cyan-400">(</span>
                        <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="الإحداثي x" autoFocus
                            className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-700'}`} placeholder="x" />
                        <span className={theme.textMain}>,</span>
                        <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckStep()} aria-label="الإحداثي y"
                            className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-700'}`} placeholder="y" />
                        <span className="text-cyan-400">)</span>
                    </>
                )}
            </div>
            <LabTutorialNote
                from={step < 4
                    ? `المعادلة الحالية: y = ${step < 2 ? problem.m1 : problem.m2}x ${(step < 2 ? problem.b1 : problem.b2) >= 0 ? '+' : ''}${step < 2 ? problem.b1 : problem.b2}.`
                    : `المستقيمان مرسومان الآن، وتقاطعهما ظاهر في الشبكة الجانبية.`}
                why={step === 0 || step === 2
                    ? `المعامل m هو الرقم الملاصق لـ x، والثابت b هو الرقم المستقل عنه.`
                    : step === 1 || step === 3
                        ? `نعوّض قيمتين مختلفتين لـ x في نفس المعادلة لنحصل على نقطتين، وهما كافيتان لرسم مستقيم كامل.`
                        : `نقطة التقاطع هي الإحداثيات المشتركة بين المستقيمين — وهي حل الجملة الوحيد.`}
            />
            <button onClick={handleCheckStep} className="mt-4 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                <CheckCircle2 size={18} /> تأكيد الخطوة
            </button>
        </LabChallenge>
    );
}

export default function SystemsGraphLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="sys-graph"
            phase={phase}
            title="الرادار الهندسي"
            badgeText="رادار مسح الأنظمة"
            badgeIcon={Crosshair}
            accentColor="cyan"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <SystemsGraphContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
