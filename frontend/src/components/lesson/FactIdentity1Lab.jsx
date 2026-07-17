import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Binary, SearchCode, ArrowDown, Microscope } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rewardService } from '../../utils/rewardService';
import LabShell from './LabShell';
import LabChallenge from './LabChallenge';
import { useLabTheme } from './LabThemeContext';

function FactIdentity1Content({ phase, setPhase }) {
    const { theme, isDarkMode } = useLabTheme();

    const [learnStep, setLearnStep] = useState(0);
    const [problem, setProblem] = useState({ a: 5 });
    const [step, setStep] = useState(1); // 1:x² 2:b² 3:mid 4:input 5:done
    const [inputA, setInputA] = useState('');
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [reward, setReward] = useState(null);

    const learnPages = [
        {
            title: 'بروتوكول استعادة المربع',
            detail: 'التحليل بالمتطابقة الأولى هو عملية عكسية لنشر مربع المجموع — نعيد العبارة الطويلة إلى قوس مربع.',
            math: 'a² + 2ab + b² = (a + b)²',
            icon: <Microscope size={20} />,
        },
        {
            title: 'خوارزمية الجذور',
            detail: 'نستخرج الجذر التربيعي للحد الأول (a) وللحد الأخير (b)، ثم نتحقق أن الحد الأوسط يساوي ضعف جداءهما.',
            math: '√(a²) → a  ,  √(b²) → b',
            icon: <Binary size={20} />,
        },
    ];

    const generateProblem = () => {
        const a = Math.floor(Math.random() * 8) + 2;
        setProblem({ a });
        setPhase('practice');
        setStep(1);
        setInputA('');
        setError(false);
        setFeedback(null);
        setReward(null);
    };

    // خطوات الضغط التفاعلي
    const handleFirstTermClick = () => { if (step === 1) setStep(2); };
    const handleLastTermClick = () => { if (step === 2) setStep(3); };
    const handleMiddleTermClick = () => { if (step === 3) setStep(4); };

    const checkMastery = async () => {
        if (parseInt(inputA) === problem.a) {
            setStep(5);
            setFeedback({ type: 'success', text: 'تمت استعادة المربع بنجاح!' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            try {
                const data = await rewardService.claimLabReward('fact-identity-1');
                if (data.status === 'success') setReward(data);
            } catch (err) { console.error(err); }
        } else {
            setError(true);
            setFeedback({ type: 'error', text: 'تحقق من الجذر التربيعي للحد الأخير.' });
            setTimeout(() => { setError(false); setFeedback(null); }, 1500);
        }
    };

    // ── intro ─────────────────────────────────────────────────────────────────
    if (phase === 'intro') return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2">
            <div className={`p-6 rounded-[1rem] border backdrop-blur-3xl ${theme.card}`}>
                <h3 className={`text-base font-black mb-3 ${theme.textMain}`}>قانون الاستعادة:</h3>
                <div className={`p-4 rounded-xl border font-mono text-center text-sm text-cyan-400 mb-4 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-cyan-50 border-cyan-100'}`}>
                    a² + 2ab + b² = (a + b)²
                </div>
                <button
                    onClick={() => setPhase('learn')}
                    className={`w-full py-3 rounded-xl font-bold transition-all border text-sm ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100'}`}
                >
                    مراجعة خوارزمية الجذور
                </button>
            </div>
            <motion.button
                onClick={generateProblem}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-[1rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-cyan-600" />
                <div className="relative p-8 flex flex-col items-center justify-center text-white gap-2">
                    <SearchCode size={40} />
                    <span className="font-black text-xl uppercase tracking-widest">بدء الاستعادة</span>
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
                    : <button onClick={generateProblem} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black">دخول المختبر</button>
                }
            </div>
        </div>
    );

    // ── practice ──────────────────────────────────────────────────────────────
    return (
        <LabChallenge
            type="visual"
            current={1}
            total={1}
            level={1}
            hint="اضغط أولاً على x²، ثم على الحد الأخير، ثم على الحد الأوسط للتحقق."
            feedback={feedback}
            reward={reward}
            onRefresh={generateProblem}
            onRestart={() => { setPhase('intro'); setReward(null); }}
        >
            {/* ── العبارة التفاعلية ─────────────────────────────────────────── */}
            <div className="w-full flex flex-col items-center gap-4">

                {/* تعليمة الخطوة */}
                <p className={`text-[11px] uppercase tracking-widest font-black text-center ${theme.textSub}`}>
                    {step === 1 && 'اضغط على x² لاستخراج جذره'}
                    {step === 2 && `اضغط على ${problem.a * problem.a} لاستخراج جذره`}
                    {step === 3 && `اضغط على ${2 * problem.a}x للتحقق من الحد الأوسط`}
                    {step === 4 && 'أدخل قيمة b في القوس المربع'}
                    {step === 5 && '✓ تمت الاستعادة بنجاح'}
                </p>

                {/* الحدود الثلاثة */}
                <div className="flex flex-wrap items-center justify-center gap-3 font-mono font-black text-lg" dir="ltr">
                    {/* x² */}
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

                    <span className={`opacity-40 ${theme.textMain}`}>+</span>

                    {/* الحد الأوسط */}
                    <motion.div
                        onClick={handleMiddleTermClick}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 3 && (e.preventDefault(), handleMiddleTermClick())}
                        role="button" tabIndex={step === 3 ? 0 : -1} aria-label={`اضغط على ${2 * problem.a}x للتحقق من الحد الأوسط`}
                        whileTap={step === 3 ? { scale: 0.92 } : {}}
                        className={`px-5 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${step === 3 ? `cursor-pointer border-cyan-400 ${isDarkMode ? 'bg-cyan-500/10 text-white animate-pulse' : 'bg-cyan-50 text-cyan-700'}` :
                                step > 3 ? `text-cyan-400 ${isDarkMode ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}` :
                                    `opacity-30 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-400'}`
                            }`}
                    >{2 * problem.a}x</motion.div>

                    <span className={`opacity-40 ${theme.textMain}`}>+</span>

                    {/* الحد الأخير b² */}
                    <motion.div
                        onClick={handleLastTermClick}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && step === 2 && (e.preventDefault(), handleLastTermClick())}
                        role="button" tabIndex={step === 2 ? 0 : -1} aria-label={`اضغط على ${problem.a * problem.a} لاستخراج جذره`}
                        whileTap={step === 2 ? { scale: 0.92 } : {}}
                        className={`px-5 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${step === 2 ? `cursor-pointer border-amber-400 ${isDarkMode ? 'bg-amber-500/10 text-white animate-pulse' : 'bg-amber-50 text-amber-700'}` :
                                step >= 3 ? `text-amber-400 ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}` :
                                    `opacity-30 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-400'}`
                            }`}
                    >{problem.a * problem.a}</motion.div>
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
                                <div className={`px-4 py-2 rounded-xl border font-mono text-sm font-black ${isDarkMode ? 'bg-black/40 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>{problem.a}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* خطوة الإدخال */}
                <AnimatePresence>
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3 w-full"
                        >
                            <div className="flex items-center gap-2 font-mono font-black text-lg" dir="ltr">
                                <span className={`opacity-50 ${theme.textMain}`}>(x +</span>
                                <input
                                    type="number"
                                    value={inputA}
                                    onChange={e => setInputA(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && checkMastery()}
                                    aria-label="أدخل قيمة b"
                                    className={`w-20 rounded-xl text-center p-3 outline-none border-2 transition-all font-black ${error
                                            ? 'border-rose-500'
                                            : isDarkMode ? 'bg-black/60 border-cyan-500/50 text-cyan-400 focus:border-cyan-400' : 'bg-white border-cyan-200 text-cyan-700 focus:border-cyan-500'
                                        }`}
                                    placeholder="?"
                                    autoFocus
                                />
                                <span className={`opacity-50 ${theme.textMain}`}>)²</span>
                            </div>
                            <button
                                onClick={checkMastery}
                                className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black flex items-center gap-2 transition-all"
                            >
                                <CheckCircle2 size={18} /> تأكيد
                            </button>
                        </motion.div>
                    )}

                    {/* النتيجة النهائية */}
                    {step === 5 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-2xl border-2 font-mono font-black text-lg text-center ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}
                            dir="ltr"
                        >
                            <span className={`opacity-60 ${theme.textMain}`}>(</span>
                            <span className="text-sky-400">x</span>
                            <span className={`opacity-60 ${theme.textMain}`}> + </span>
                            <span className="text-amber-400">{problem.a}</span>
                            <span className={`opacity-60 ${theme.textMain}`}>)²</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LabChallenge>
    );
}

export default function FactIdentity1Lab() {
    const [phase, setPhase] = useState('intro');
    return (
        <LabShell
            labId="fact-identity-1"
            phase={phase}
            title="تحليل المربع الكامل"
            badgeText="التحليل العكسي — المتطابقة الأولى"
            badgeIcon={SearchCode}
            accentColor="cyan"
            onBack={phase !== 'intro' ? () => setPhase('intro') : undefined}
        >
            <FactIdentity1Content phase={phase} setPhase={setPhase} />
        </LabShell>
    );
}
