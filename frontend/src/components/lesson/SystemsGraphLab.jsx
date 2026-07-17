import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, CheckCircle2, ArrowRight, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabStepsPanel from './LabStepsPanel';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';

function SystemsGraphContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [level, setLevel] = useState(1);
    const [step, setStep] = useState(0); // 0..4: خطوات، 5: تم
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    useEffect(() => {
        labProgressService.getOne('sys-graph')
            .then(progress => { if (progress) setLevel(difficultyEngine.getLevel(progress)); })
            .catch(() => { });
    }, []);

    // المسألة: x + y = 3  و  x - y = 1  →  (2, 1)
    const problem = {
        m1: -1, b1: 3, pt1_y1: 3, pt1_y2: 0,
        m2: 1, b2: -1, pt2_y1: -1, pt2_y2: 2,
        ans_x: 2, ans_y: 1,
    };

    const learnPages = [
        { title: 'مبدأ الرسم البياني', detail: 'كل معادلة في الجملة تمثل خطاً مستقيماً. الحل هو النقطة الوحيدة التي يتقاطع فيها المستقيمان.' },
        { title: 'الصياغة الدالية', detail: 'نعزل y لتصبح المعادلة على شكل y = ax + b قابلة للرسم.', math: 'x + y = 3 ⟶ y = -x + 3' },
        { title: 'النقطتان السحريتان', detail: 'نعطي قيمتين اختياريتين لـ x (مثلاً 0 و3) ونحسب y المقابلة لرسم المستقيم.' },
        { title: 'المسح الإحداثي', detail: 'نرسم المستقيم الثاني بنفس الطريقة، ثم نقرأ إحداثيات نقطة التقاطع.', math: '(2, 1)' },
    ];

    const hints = [
        'انقل x إلى الطرف الآخر وغيّر إشارته ليصبح -x.',
        'عوض x بصفر في المعادلة (y = -x + 3)، ثم بـ 3.',
        'انقل -y للطرف الآخر لتصبح موجبة، وانقل 1 ليصبح سالباً.',
        'عوض x بصفر في المعادلة (y = x - 1)، ثم بـ 3.',
        'اقرأ إحداثيات نقطة تقاطع المستقيمين على الرسم.',
    ];

    const stepInstructions = [
        'صيغة y للدالة الأولى: y = mx + b',
        'جدول قيم المستقيم الأول (x=0 و x=3)',
        'صيغة y للدالة الثانية: y = mx + b',
        'جدول قيم المستقيم الثاني (x=0 و x=3)',
        'إحداثيات نقطة التقاطع (x, y)',
    ];

    const resetChallenge = () => {
        setStep(0); setInput1(''); setInput2('');
        setError(false); setFeedback(null); setReward(null);
        setPhase('practice');
        labProgressService.update('sys-graph', 'practice').catch(() => { });
    };

    const handleCheckStep = async () => {
        let isCorrect = false;
        if (step === 0) isCorrect = parseInt(input1) === problem.m1 && parseInt(input2) === problem.b1;
        else if (step === 1) isCorrect = parseInt(input1) === problem.pt1_y1 && parseInt(input2) === problem.pt1_y2;
        else if (step === 2) isCorrect = parseInt(input1) === problem.m2 && parseInt(input2) === problem.b2;
        else if (step === 3) isCorrect = parseInt(input1) === problem.pt2_y1 && parseInt(input2) === problem.pt2_y2;
        else if (step === 4) isCorrect = parseInt(input1) === problem.ans_x && parseInt(input2) === problem.ans_y;

        if (isCorrect) {
            setError(false);
            setInput1(''); setInput2('');
            setFeedback({ type: 'success', text: 'صحيح! انتقل للخطوة التالية.' });

            if (step < 4) {
                confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
                setTimeout(() => { setStep(s => s + 1); setFeedback(null); }, 900);
            } else {
                setTimeout(async () => {
                    setStep(5);
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                    await labProgressService.update('sys-graph', 'completed', 100).catch(() => { });
                    try {
                        const data = await rewardService.claimLabReward('sys-graph-mastery');
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
                </p>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black transition-all">
                    فتح الدليل التفاعلي
                </button>
            </div>
            <button onClick={resetChallenge} className={`text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${theme.textMain}`}>
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
                    : <button onClick={resetChallenge} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">بدء التدريب <Rocket size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge + LabStepsPanel (رسم بياني حي) ────────
    const stepsForPanel = [
        { label: 'Eq (1): x + y = 3', done: step > 0 },
        { label: 'Eq (2): x - y = 1', done: step > 2 },
        ...(step > 3 ? [{ label: `تقاطع: (${problem.ans_x}, ${problem.ans_y})`, active: step === 4 }] : []),
    ];

    return (
        <LabChallenge
            type="text"
            current={step + 1}
            total={5}
            level={level}
            question={stepInstructions[step]}
            hint={hints[step]}
            feedback={feedback}
            reward={reward}
            onRefresh={resetChallenge}
            onRestart={() => { setPhase('intro'); resetChallenge(); setReward(null); }}
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
                                        x1="-6" y1="9" x2="6" y2="-3" stroke="#f59e0b" strokeWidth="0.25" strokeLinecap="round" />
                                )}
                                {step > 3 && (
                                    <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1 }}
                                        x1="-4.5" y1="-5.5" x2="6.5" y2="5.5" stroke="#6366f1" strokeWidth="0.25" strokeLinecap="round" />
                                )}
                                {step > 3 && (
                                    <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.6 }}
                                        cx="2" cy="1" r="0.4" fill="#22d3ee" />
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
