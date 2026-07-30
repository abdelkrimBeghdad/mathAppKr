import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    return levels.map(lvl => ({ level: lvl, problem: difficultyEngine.generateChallenge('vec-calc', lvl) }));
}

function VecCalcContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(0); // 0: تطبيق القانون، 1: النتيجة النهائية
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');
    const [input4, setInput4] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const currentChallenge = roundData.problem; // { ax, ay, bx, by, dx, dy }

    useEffect(() => {
        labProgressService.getOne('vec-calc')
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
            title: 'القانون الذهبي',
            detail: 'لحساب مركبات أي شعاع جبرياً (بدون رسم)، نطبق قاعدة واحدة صارمة: النهاية ناقص البداية.',
            visual: (
                <div className="flex flex-col gap-3 text-lg font-mono text-center" dir="ltr">
                    <div className={theme.textMain}>AB</div>
                    <div className="text-emerald-400 text-base">Xᵦ - Xₐ</div>
                    <div className="text-cyan-400 text-base">Yᵦ - Yₐ</div>
                </div>
            ),
        },
        {
            title: 'تطبيق مباشر',
            detail: 'إذا كانت A(1, 2) و B(4, 5). نبدأ دائماً بإحداثيات النقطة B.',
            visual: (
                <div className="flex flex-col gap-3 text-lg font-mono text-center" dir="ltr">
                    <div className="flex items-center justify-center gap-4">
                        <span className="opacity-60">A(1, 2)</span>
                        <span className="text-amber-400">B(4, 5)</span>
                    </div>
                    <div className={`mt-1 ${theme.textMain}`}>
                        <span className="text-amber-400">4</span> - <span className="opacity-60">1</span> = <span className="text-emerald-400">3</span>
                    </div>
                    <div className={theme.textMain}>
                        <span className="text-amber-400">5</span> - <span className="opacity-60">2</span> = <span className="text-cyan-400">3</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'فخ الإشارات!',
            detail: 'احذر عندما تكون إحداثيات البداية سالبة! قاعدة الطرح مع الرقم السالب تتحول إلى جمع.',
            visual: (
                <div className="flex flex-col gap-3 text-lg font-mono text-center" dir="ltr">
                    <div className="flex items-center justify-center gap-4">
                        <span className="opacity-60">A(-2, 3)</span>
                        <span className="text-amber-400">B(1, 5)</span>
                    </div>
                    <div className={theme.textMain}>
                        <span className="text-amber-400">1</span> - <span className="text-rose-400">(-2)</span> = <span className="text-emerald-400 font-black">1 + 2 = 3</span>
                    </div>
                </div>
            ),
        },
    ];

    const hints = [
        'ابدأ دائماً بإحداثيات النقطة B (النهاية) ثم اطرح منها إحداثيات النقطة A (البداية).',
        'قم بإجراء العملية الحسابية. تذكر أن: ناقص عدد سالب يساوي زائد!',
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(0);
        setInput1(''); setInput2(''); setInput3(''); setInput4('');
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('vec-calc', 'practice').catch(() => { });
    };

    const handleAnswer = async () => {
        let isCorrect = false;
        if (step === 0) {
            isCorrect = parseInt(input1) === currentChallenge.bx && parseInt(input2) === currentChallenge.ax &&
                parseInt(input3) === currentChallenge.by && parseInt(input4) === currentChallenge.ay;
        } else {
            isCorrect = parseInt(input1) === currentChallenge.dx && parseInt(input2) === currentChallenge.dy;
        }

        if (isCorrect) {
            setError(false);
            setInput1(''); setInput2(''); setInput3(''); setInput4('');

            if (step === 0) {
                setFeedback({ type: 'success', text: 'صحيح! الآن أجرِ العملية الحسابية.' });
                setTimeout(() => { setStep(1); setFeedback(null); }, 900);
            } else if (round < 2) {
                setFeedback({ type: 'success', text: `ممتاز! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
                setTimeout(() => { setRound(r => r + 1); setStep(0); setFeedback(null); }, 1300);
            } else {
                setFeedback({ type: 'success', text: 'أتقنت حساب مركبات المتجه!' });
                confetti({ particleCount: 130, spread: 70, origin: { y: 0.6 } });
                await labProgressService.update('vec-calc', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('vec-calc', {
                        type: 'vec-calc', ax: currentChallenge.ax, ay: currentChallenge.ay, bx: currentChallenge.bx, by: currentChallenge.by, dx: currentChallenge.dx, dy: currentChallenge.dy,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع القانون: النهاية ناقص البداية.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="flex flex-col items-center max-w-2xl text-center px-4">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl w-full mb-3 ${theme.card}`}>
                <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Calculator size={20} />
                </div>
                <p className={`${theme.textSub} text-sm font-medium mb-3`}>
                    لا حاجة للرسم بعد الآن! تعلم كيف تحسب مركبات أي شعاع باستخدام إحداثيات بدايته ونهايته بدقة تامة.
                    ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.
                </p>
                <div className={`mb-4 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black transition-all">
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
                    <div className={`p-5 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        {learnPages[learnStep].visual}
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black flex items-center gap-2">التدريب <CheckCircle2 size={18} /></button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    return (
        <LabChallenge
            type="text"
            current={round + 1}
            total={3}
            level={roundData.level}
            question={`احسب مركبات الشعاع AB : A(${currentChallenge.ax}, ${currentChallenge.ay})  B(${currentChallenge.bx}, ${currentChallenge.by})`}
            hint={hints[step]}
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(0); setInput1(''); setInput2(''); setInput3(''); setInput4(''); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <p className={`text-xs font-black uppercase tracking-widest ${theme.textSub}`}>
                    {step === 0 ? 'الخطوة 1: طبق القانون (النهاية ناقص البداية)' : 'الخطوة 2: أجرِ العمليات الحسابية'}
                </p>

                <div className="flex items-center gap-3 font-mono font-black" dir="ltr">
                    <span className="text-emerald-400 text-xl">AB (</span>
                    {step === 0 ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="X_B" autoFocus
                                    className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} placeholder="Xᵦ" />
                                <span className={theme.textMain}>-</span>
                                <input type="number" value={input2} onChange={e => setInput2(e.target.value)} aria-label="X_A"
                                    className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-slate-500/50 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`} placeholder="Xₐ" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="number" value={input3} onChange={e => setInput3(e.target.value)} aria-label="Y_B"
                                    className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-amber-500/50 text-amber-400' : 'bg-white border-amber-200 text-amber-700'}`} placeholder="Yᵦ" />
                                <span className={theme.textMain}>-</span>
                                <input type="number" value={input4} onChange={e => setInput4(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="Y_A"
                                    className={`w-16 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-slate-500/50 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`} placeholder="Yₐ" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <input type="number" value={input1} onChange={e => setInput1(e.target.value)} aria-label="قيمة x" autoFocus
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="x" />
                            <input type="number" value={input2} onChange={e => setInput2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} aria-label="قيمة y"
                                className={`w-20 rounded-xl text-center p-2 outline-none border-2 ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400' : 'bg-white border-cyan-200 text-cyan-700'}`} placeholder="y" />
                        </div>
                    )}
                    <span className="text-emerald-400 text-xl">)</span>
                </div>

                {step === 1 && (
                    <LabTutorialNote
                        from={`طبّقت القانون: AB = (${currentChallenge.bx} − ${currentChallenge.ax}, ${currentChallenge.by} − ${currentChallenge.ay}).`}
                        why={`الآن فقط عملية حسابية بسيطة${currentChallenge.ax < 0 || currentChallenge.ay < 0 ? '، احذر: طرح رقم سالب يتحول إلى جمع!' : '.'}`}
                    />
                )}

                <button onClick={handleAnswer} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                    <CheckCircle2 size={18} /> تأكيد
                </button>
            </div>
        </LabChallenge>
    );
}

export default function VecCalcLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="vec-calc"
            phase={phase}
            title="شيفرة الإحداثيات"
            badgeText="الحساب الجبري للمتجهات"
            badgeIcon={Calculator}
            accentColor="emerald"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <VecCalcContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
