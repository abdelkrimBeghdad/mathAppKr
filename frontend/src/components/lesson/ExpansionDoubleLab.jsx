import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import LabTutorialNote from './LabTutorialNote';
import { useLabTheme } from './LabThemeContext';
import { labProgressService } from '../../utils/labProgressService';
import { difficultyEngine } from '../../utils/difficultyEngine';
import { rewardService } from '../../utils/rewardService';

// 3 جولات تصاعدية الصعوبة قبل منح المكافأة (مبتدئ ➜ متوسط ➜ متقدم)
function buildRounds(baseLevel) {
    const levels = [baseLevel, Math.min(3, baseLevel + 1), 3];
    return levels.map(lvl => {
        const params = difficultyEngine.getParams('expansion', lvl);
        const maxVal = params.maxCoeff || 5;
        const b = Math.floor(Math.random() * maxVal) + 1;
        const d = Math.floor(Math.random() * maxVal) + 1;
        return { level: lvl, b, d };
    });
}

function ExpansionDoubleContent({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [baseLevel, setBaseLevel] = useState(1);
    const [rounds, setRounds] = useState(() => buildRounds(1));
    const [round, setRound] = useState(0);
    const [step, setStep] = useState(1); // 1-6: تفاعل، 7: إدخال، 8: تم
    const [inputs, setInputs] = useState({ x: '', c: '' });
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const roundData = rounds[round];
    const problem = roundData; // { level, b, d }

    useEffect(() => {
        labProgressService.getOne('exp-double')
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
        { title: 'بروتوكول التوزيع الرباعي', detail: 'النشر المزدوج هو عملية توزيع كل حد من القوس الأول على كل حد من القوس الثاني بالتساوي.', math: '(a + b)(c + d) = ac + ad + bc + bd', icon: <Layers size={20} /> },
        { title: 'خوارزمية المسارات الأربعة', detail: 'نبدأ بالحد الأول (x) ونوزعه، ثم ننتقل للحد الثاني ونوزعه، لضمان تغطية كافة الاحتمالات.', math: 'الخطوة 1: x × x → x²', icon: <Rocket size={20} /> },
    ];

    const resetAll = () => {
        setRounds(buildRounds(baseLevel));
        setRound(0);
        setStep(1);
        setInputs({ x: '', c: '' });
        setError(false); setFeedback(null);
    };

    const startPractice = () => {
        resetAll();
        setPhase('practice');
        setReward(null);
        labProgressService.update('exp-double', 'practice').catch(() => { });
    };

    const handleFirstOuterClick = () => { if (step === 1) setStep(2); };
    const handleDist1 = () => { if (step === 2) setStep(3); };
    const handleDist2 = () => { if (step === 3) setStep(4); };
    const handleSecondOuterClick = () => { if (step === 4) setStep(5); };
    const handleDist3 = () => { if (step === 5) setStep(6); };
    const handleDist4 = () => { if (step === 6) setStep(7); };

    const checkMastery = async () => {
        const correctX = problem.b + problem.d;
        const correctC = problem.b * problem.d;
        if (parseInt(inputs.x) === correctX && parseInt(inputs.c) === correctC) {
            setStep(8);
            setError(false);
            if (round < 2) {
                setFeedback({ type: 'success', text: `دمج هيكلي مثالي! أنهيت مستوى ${['', 'مبتدئ', 'متوسط', 'متقدم'][roundData.level]}. الجولة التالية أصعب.` });
                setTimeout(() => {
                    setRound(r => r + 1);
                    setStep(1);
                    setInputs({ x: '', c: '' });
                    setFeedback(null);
                }, 1600);
            } else {
                setFeedback({ type: 'success', text: 'دمج هيكلي مثالي! غطيت كل المسارات الأربعة بدقة.' });
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                await labProgressService.update('exp-double', 'completed', 100).catch(() => { });
                try {
                    const data = await rewardService.claimLabReward('exp-double', {
                        type: 'expand-double', b: problem.b, d: problem.d, midTerm: correctX, lastTerm: correctC,
                    });
                    if (data.status === 'success') setReward(data);
                } catch (err) { console.error(err); }
            }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'راجع: الحد الأوسط = مجموع b+d، والأخير = حاصل ضربهما.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1000);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>خارطة التوزيع الرباعي:</h3>
                <div className={`p-4 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-50 border-indigo-100'}`}>
                    <span className="font-mono font-black text-indigo-400 text-sm" dir="ltr">(a+b)(c+d) = ac + ad + bc + bd</span>
                </div>
                <p className={`text-xs ${theme.textSub} mt-2 text-center`}>ستمر بـ 3 جولات تتصاعد صعوبتها تدريجياً قبل الحصول على المكافأة.</p>
                <div className={`mt-2 mb-1 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 w-full justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    ستبدأ من مستوى: {['', 'مبتدئ', 'متوسط', 'متقدم'][baseLevel]}
                </div>
                <button onClick={() => setPhase('learn')} className={`mt-4 w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}>
                    فتح دليل المسارات
                </button>
            </div>
            <motion.button onClick={startPractice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative rounded-[1rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-3">
                    <Layers size={36} />
                    <span className="font-black text-xl uppercase tracking-widest">تفعيل المصفوفة</span>
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
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">{learnPages[learnStep].icon}</div>
                    <h3 className={`text-base font-black mb-4 ${theme.textMain}`}>{learnPages[learnStep].title}</h3>
                    <p className={`text-sm ${theme.textSub} mb-4 max-w-2xl mx-auto font-medium`}>{learnPages[learnStep].detail}</p>
                    <div className={`p-4 rounded-2xl border mx-auto max-w-md ${isDarkMode ? 'bg-black/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <span className="font-mono font-black text-indigo-400" dir="ltr">{learnPages[learnStep].math}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between items-center mt-6 px-4">
                <button onClick={() => learnStep > 0 ? setLearnStep(l => l - 1) : setPhase('intro')}
                    className={`px-4 py-2 rounded-xl font-black transition-all ${isDarkMode ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >السابق</button>
                {learnStep < learnPages.length - 1
                    ? <button onClick={() => setLearnStep(l => l + 1)} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2">التالي <ArrowRight size={18} /></button>
                    : <button onClick={startPractice} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">دخول التجربة</button>
                }
            </div>
        </div>
    );

    // ── practice — يستخدم LabChallenge ───────────────────────────────────────
    const stepLabel = step < 4 ? `توزيع القطب A` : step < 7 ? `توزيع القطب B` : 'الدمج الهيكلي';

    return (
        <LabChallenge
            type="visual"
            current={round + 1}
            total={3}
            level={roundData.level}
            question={stepLabel}
            hint="اضغط على كل حد بالترتيب لتوزيعه على القوس الآخر — خطوة بخطوة."
            feedback={feedback}
            reward={reward}
            onRefresh={() => { setStep(1); setInputs({ x: '', c: '' }); setError(false); setFeedback(null); }}
            onRestart={() => { setPhase('intro'); resetAll(); setReward(null); }}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-center gap-1 font-mono font-black text-lg" dir="ltr">
                    <span className={`opacity-40 ${theme.textMain}`}>(</span>
                    <motion.div
                        onClick={handleFirstOuterClick}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 1 && (e.preventDefault(), handleFirstOuterClick())}
                        role="button" tabIndex={step === 1 ? 0 : -1} aria-label="اضغط على x للتوزيع"
                        whileTap={step === 1 ? { scale: 0.9 } : {}}
                        className={`px-3 py-1.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${step === 1 ? 'cursor-pointer' : ''} ${step >= 2 ? 'text-sky-400 bg-sky-500/10' : step === 1 ? `${theme.textMain} bg-white/5 border-2 border-white/20 animate-pulse` : 'opacity-30'}`}
                    >x</motion.div>
                    <span className={`opacity-40 ${theme.textMain}`}>+</span>
                    <motion.div
                        onClick={handleSecondOuterClick}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 4 && (e.preventDefault(), handleSecondOuterClick())}
                        role="button" tabIndex={step === 4 ? 0 : -1} aria-label={`اضغط على ${problem.b} للتوزيع`}
                        whileTap={step === 4 ? { scale: 0.9 } : {}}
                        className={`px-3 py-1.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${step === 4 ? 'cursor-pointer' : ''} ${step >= 5 ? 'text-amber-400 bg-amber-500/10' : step === 4 ? `${theme.textMain} bg-white/5 border-2 border-white/20 animate-pulse` : 'opacity-30'}`}
                    >{problem.b}</motion.div>
                    <span className={`opacity-40 ${theme.textMain}`}>)(</span>
                    <motion.div
                        onClick={step === 2 ? handleDist1 : step === 5 ? handleDist3 : undefined}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (step === 2 || step === 5) && (e.preventDefault(), step === 2 ? handleDist1() : handleDist3())}
                        role="button" tabIndex={(step === 2 || step === 5) ? 0 : -1} aria-label="اضغط على x للتوزيع الداخلي"
                        whileTap={(step === 2 || step === 5) ? { scale: 0.9 } : {}}
                        className={`px-3 py-1.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${(step === 2 || step === 5) ? 'cursor-pointer' : ''} ${(step === 2 || step === 5) ? `${theme.textMain} bg-white/5 border-2 border-white/20 animate-pulse` : (step > 2 && step !== 5 && step < 7 ? 'text-sky-400 opacity-60' : 'opacity-30')}`}
                    >x</motion.div>
                    <span className={`opacity-40 ${theme.textMain}`}>+</span>
                    <motion.div
                        onClick={step === 3 ? handleDist2 : step === 6 ? handleDist4 : undefined}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (step === 3 || step === 6) && (e.preventDefault(), step === 3 ? handleDist2() : handleDist4())}
                        role="button" tabIndex={(step === 3 || step === 6) ? 0 : -1} aria-label={`اضغط على ${problem.d} للتوزيع الداخلي`}
                        whileTap={(step === 3 || step === 6) ? { scale: 0.9 } : {}}
                        className={`px-3 py-1.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${(step === 3 || step === 6) ? 'cursor-pointer' : ''} ${(step === 3 || step === 6) ? `${theme.textMain} bg-white/5 border-2 border-white/20 animate-pulse` : (step > 3 && step !== 6 && step < 7 ? 'text-amber-400 opacity-60' : 'opacity-30')}`}
                    >{problem.d}</motion.div>
                    <span className={`opacity-40 ${theme.textMain}`}>)</span>
                </div>

                <AnimatePresence>
                    {step === 7 && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 w-full">
                            <div className="flex flex-wrap items-center justify-center gap-2 font-mono font-black text-base" dir="ltr">
                                <div className="relative text-sky-400">x<span className="absolute -top-3 -right-3 text-xs">2</span></div>
                                <span className={`opacity-40 ${theme.textMain}`}>+</span>
                                <input type="number" value={inputs.x} onChange={e => setInputs({ ...inputs, x: e.target.value })} aria-label="الحد الأوسط" autoFocus
                                    className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-indigo-500/50 text-indigo-400' : 'bg-white border-indigo-200 text-indigo-700'}`} placeholder="؟" />
                                <span className={`italic opacity-60 ${theme.textMain}`}>x</span>
                                <span className={`opacity-40 ${theme.textMain}`}>+</span>
                                <input type="number" value={inputs.c} onChange={e => setInputs({ ...inputs, c: e.target.value })} onKeyDown={e => e.key === 'Enter' && checkMastery()} aria-label="الحد الأخير"
                                    className={`w-20 rounded-xl text-center p-2 outline-none border-2 transition-all ${error ? 'border-rose-500' : isDarkMode ? 'bg-black/60 border-emerald-500/50 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'}`} placeholder="؟" />
                            </div>
                            <LabTutorialNote
                                from={`المسارات الأربعة كانت: x×x، x×${problem.d}، ${problem.b}×x، و${problem.b}×${problem.d}.`}
                                why={`الحد الأوسط يتكوّن من دمج الناتجين الوسطيين (x×${problem.d} و${problem.b}×x) لأنهما يحملان نفس الدرجة (x¹): ${problem.d} + ${problem.b} = ${problem.b + problem.d}. أما الحد الأخير فهو ببساطة ${problem.b} × ${problem.d} = ${problem.b * problem.d}.`}
                            />
                            <button onClick={checkMastery} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black flex items-center gap-2 transition-all">
                                <CheckCircle2 size={18} /> تأكيد العملية
                            </button>
                        </motion.div>
                    )}

                    {step === 8 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-2xl border-2 font-mono font-black flex items-center gap-3 flex-wrap justify-center ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}
                            dir="ltr"
                        >
                            <div className="relative text-sky-400">x<span className="absolute -top-3 -right-3 text-xs">2</span></div>
                            <span className={`opacity-40 ${theme.textMain}`}>+</span>
                            <span className="text-indigo-400">{problem.b + problem.d}x</span>
                            <span className={`opacity-40 ${theme.textMain}`}>+</span>
                            <span className="text-emerald-400">{problem.b * problem.d}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LabChallenge>
    );
}

export default function ExpansionDoubleLab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="exp-double"
            phase={phase}
            title="النشر المزدوج"
            badgeText="بروتوكول التوزيع الرباعي"
            badgeIcon={Layers}
            accentColor="indigo"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <ExpansionDoubleContent phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
